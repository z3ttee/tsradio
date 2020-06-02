package live.tsradio.daemon.channel

import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.database.MySQL
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.listener.ChannelEventListener
import live.tsradio.daemon.listener.REASON_CHANNEL_EXCEPTION
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.ResultSet
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.ThreadFactory
import kotlin.collections.HashMap

object ChannelHandler: ChannelEventListener, ThreadFactory {
    private val logger: Logger = LoggerFactory.getLogger(ChannelHandler::class.java)

    val configuredChannels: HashMap<String, Channel> = HashMap()
    val activeChannels: HashMap<String, Channel> = HashMap()
    private val restartTries: HashMap<String, Int> = HashMap()
    private val executorService: ExecutorService = Executors.newFixedThreadPool(Filesystem.preferences.channels.max, this)

    fun startChannel(channel: Channel?) {
        if(channel == null) {
            logger.warn("Cannot start non-existent channel")
            return
        }

        if(activeChannels.size < Filesystem.preferences.channels.max) {
            channel.channelEventListener = this
            channel.shutdown = false
            channel.forceShutdown = false
            activeChannels[channel.channelID] = channel
            executorService.execute(channel)
        }
    }
    fun startChannel(channelName: String) {
        val channel = getChannelByNameLocally(channelName) ?: return
        startChannel(configuredChannels[channel.channelID])
    }

    //TODO: Test
    private fun stopChannel(channel: Channel?, forceStop: Boolean) {
        if(channel == null) {
            logger.warn("Cannot stop non-existent channel")
            return
        }

        channel.cancel(forceStop)
        channel.join()

        channel.channelInfo.update()
    }
    fun stopChannel(channelName: String, forceStop: Boolean) {
        val channel = getChannelByNameLocally(channelName)?: return
        stopChannel(activeChannels[channel.channelID],forceStop)
    }
    fun restartChannel(channelName: String) {
        val channel = getChannelByNameLocally(channelName)?: return

        stopChannel(channel, true)
        while (activeChannels.containsKey(channel.channelID)){
            // Wait
            Thread.sleep(1000)
        }
        startChannel(channel)
    }

    fun createChannel(channel: Channel){
        try {
            MySQL.insert(MySQL.tableChannels, channel.toContentValues())
            logger.info("Channel '${channel.channelName}' created.")
            notifyChannelUpdated(channel)
        } catch (ex: Exception) {
            logger.info("Creating channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun deleteChannel(channel: Channel) {
        try {
            if(isChannelActiveByID(channel.channelID)) {
                logger.info("Preparing channel '${channel.channelName}' for deletion.")
                channel.cancel(true)
                channel.join()
                activeChannels.remove(channel.channelID)
            }
            configuredChannels.remove(channel.channelID)
            MySQL.delete(MySQL.tableChannels, "nodeID = '${Filesystem.preferences.node.nodeID}' AND id = '${channel.channelID}'")
            notifyChannelRemoved(channel.channelID)
            logger.info("Channel '${channel.channelName}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun editChannel(channelName: String, channelUUID: String, channel: Channel) {
        try {
            MySQL.update(MySQL.tableChannels, "nodeID = '${Filesystem.preferences.node.nodeID}' AND id = '$channelUUID'", channel.toContentValues())
            notifyChannelUpdated(channel)
            logger.info("Channel '$channelName' edited.")
        } catch (ex: Exception) {
            logger.info("Editing channel '$channelName' failed: ${ex.message}")
        }
    }

    fun channelExistsByName(channelName: String): Boolean {
        configuredChannels.values.forEach { if(it.channelName == channelName) return true }
        return try {
            MySQL.exists(MySQL.tableChannels, "name = '$channelName'")
        } catch (ignored: Exception) {
            ignored.printStackTrace()
            false
        }
    }
    fun channelExistsByMount(mountpoint: String): Boolean {
        configuredChannels.values.forEach { if(it.mountpoint == mountpoint) return true }
        return try {
            MySQL.exists(MySQL.tableChannels, "mountpoint = '$mountpoint'")
        } catch (ignored: Exception) {
            false
        }
    }
    fun mysqlResultToChannel(result: ResultSet): Channel {
        return Channel(
                result.getString("nodeID"),
                result.getString("id"),
                result.getString("name"),
                result.getString("description"),
                result.getString("creatorID"),
                result.getString("mountpoint"),
                result.getString("playlistID"),
                result.getBoolean("playlistShuffle"),
                result.getBoolean("playlistLoop"),
                ArrayList(result.getString("genres").split(";"))
        )
    }
    fun getChannelOnNodeByName(channelName: String): Channel? {
        val result = MySQL.get(MySQL.tableChannels, "nodeID = '${Filesystem.preferences.node.nodeID}' AND name = '$channelName'", ArrayList(listOf("*")))

        return if(result != null && result.next()) {
            mysqlResultToChannel(result)
        } else {
            null
        }
    }
    private fun getChannelByNameLocally(channelName: String): Channel? {
        var channel: Channel? = null
        for(chan in configuredChannels.values){
            if(chan.channelName == channelName) {
                channel = chan
                break
            }
        }
        return channel
    }
    fun isChannelActiveByID(channelID: String): Boolean {
        return activeChannels.containsKey(channelID)
    }


    override fun onChannelReady(channel: Channel) {
        logger.info("Channel '${channel.channelName}' is ready")
    }

    override fun onChannelDone(channel: Channel) {
        // logger.info("Channel '${channel.channelName}' done playing.")
        if(restartTries.containsKey(channel.channelName)) {
            restartTries.remove(channel.channelName)
        }
    }

    override fun onChannelStop(channel: Channel, reason: Int) {
        activeChannels.remove(channel.channelID)
        Thread.sleep(10)

        if(reason == REASON_CHANNEL_EXCEPTION && Filesystem.preferences.channels.autorestart) {
            // Restart channel
            var triesUsed = restartTries.getOrDefault(channel.channelID, 0)
            val delay: Long = (Filesystem.preferences.channels.restartDelay*1000).toLong()
            triesUsed += 1

            when {
                triesUsed == 1 -> {
                    logger.warn("Channel '${channel.channelName}' was shut down. Restarting it in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    restartTries[channel.channelID] = triesUsed
                    startChannel(channel.channelName)
                }
                triesUsed > Filesystem.preferences.channels.restartTries -> {
                    logger.error("Could not restart channel '${channel.channelName}' after ${triesUsed-1} tries.")
                    restartTries.remove(channel.channelID)
                }
                else -> {
                    // Execute with delay
                    logger.warn("Trying to restart channel '${channel.channelName}' in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    restartTries[channel.channelID] = triesUsed
                    startChannel(channel.channelName)
                }
            }
        } else {
            logger.info("Channel '${channel.channelName}' shut down.")
        }
    }

    override fun newThread(r: Runnable): Thread {
        return Thread(r, "channel-thread-${activeChannels.size+1}")
    }



    fun notifyChannelUpdated(channel: Channel){
        if(!configuredChannels.containsKey(channel.channelID)) {
            configuredChannels[channel.channelID] = channel

            if(Filesystem.preferences.channels.autostart) {
                startChannel(channel)
            }
            return
        }

        configuredChannels[channel.channelID]!!.liveUpdate(channel)
        if(activeChannels.containsKey(channel.channelID)) {
            activeChannels[channel.channelID]!!.liveUpdate(channel)
        }
    }

    fun notifyChannelRemoved(channelID: String){
        if(configuredChannels.containsKey(channelID)) configuredChannels.remove(channelID)
        if(activeChannels.containsKey(channelID)) {
            stopChannel(channelID, true)
        }
    }
}
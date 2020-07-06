package live.tsradio.nodeserver.handler

import live.tsradio.nodeserver.channel.Channel
import live.tsradio.nodeserver.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

object ChannelHandler {
    private val logger: Logger = LoggerFactory.getLogger(ChannelHandler::class.java)

    private val channels: HashMap<UUID, Channel> = HashMap()
    val restartTries: HashMap<UUID, Int> = HashMap()

    private val executorService: ExecutorService = Executors.newFixedThreadPool(Filesystem.preferences.channels.max)

    fun set(channel: Channel) {
        if(this.channels.containsKey(channel.data.id)) {
            this.channels[channel.data.id]!!.data = channel.data
        } else {
            this.channels[channel.data.id] = channel
        }
    }

    fun startChannel(uuid: UUID) {
        if(!channels.containsKey(uuid)) {
            logger.warn("Cannot start non-existent channel")
            return
        }

        if(getRunningChannels().size >= Filesystem.preferences.channels.max) {
            logger.warn("The maximum of simultaneously running channels reached!")
            return
        }

        val nodeChannel = channels[uuid]!!
        if(channelIsRunning(uuid)) {
            logger.warn("Channel '${nodeChannel.name}' is already running!")
            return
        }

        nodeChannel.execute(executorService)
    }

    fun channelExists(uuid: UUID): Boolean {
        return this.channels.containsKey(uuid)
    }

    fun channelIsRunning(uuid: UUID): Boolean {
        return if(this.channels.containsKey(uuid)) {
            this.channels[uuid]!!.isRunning
        } else {
            false
        }
    }

    fun getChannel(uuid: UUID): Channel? {
        return this.channels[uuid]
    }

    fun getRunningChannels(): ArrayList<Channel> {
        return this.channels.values.filter { it.isRunning }.toCollection(ArrayList())
    }
    fun getConfiguredChannels(): ArrayList<Channel> {
        return this.channels.values.filter { !it.isRunning }.toCollection(ArrayList())
    }
    /*fun startChannel(channelName: String) {
        val channel = getChannelByNameLocally(channelName) ?: return
        startChannel(configuredChannels[channel.data.id])
    }

    //TODO: Test
    private fun stopChannel(channel: Channel?, forceStop: Boolean) {
        if(channel == null) {
            logger.warn("Cannot stop non-existent channel")
            return
        }

        channel.cancel(forceStop)
        channel.join()

        // TODO: Trigger Channel Status Change
        //channel.channelInfo.update()
    }
    fun stopChannel(channelName: String, forceStop: Boolean) {
        val channel = getChannelByNameLocally(channelName)?: return
        stopChannel(activeChannels[channel.data.id],forceStop)
    }
    fun restartChannel(channelName: String) {
        val channel = getChannelByNameLocally(channelName)?: return

        stopChannel(channel, true)
        while (activeChannels.containsKey(channel.data.id)){
            // Wait
            Thread.sleep(1000)
        }
        startChannel(channel)
    }

    fun createChannel(channel: Channel){
        /*try {
            MySQL.insert(MySQL.tableChannels, channel.toContentValues())
            logger.info("Channel '${channel.data.name}' created.")
            notifyChannelUpdated(channel)
        } catch (ex: Exception) {
            logger.info("Creating channel '${channel.data.name}' failed: ${ex.message}")
        }*/
    }

    fun deleteChannel(channel: Channel) {
        /*try {
            if(isChannelActiveByID(channel.data.id)) {
                logger.info("Preparing channel '${channel.data.name}' for deletion.")
                channel.cancel(true)
                channel.join()
                activeChannels.remove(channel.data.id)
            }
            configuredChannels.remove(channel.data.id)
            MySQL.delete(MySQL.tableChannels, "nodeID = '${Filesystem.preferences.node.clientID}' AND id = '${channel.data.id}'")
            notifyChannelRemoved(channel.data.name)
            logger.info("Channel '${channel.data.name}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting channel '${channel.data.name}' failed: ${ex.message}")
        }*/
    }

    fun editChannel(channelName: String, channelUUID: String, channel: Channel) {
        /*try {
            MySQL.update(MySQL.tableChannels, "nodeID = '${Filesystem.preferences.node.clientID}' AND id = '$channelUUID'", channel.toContentValues())
            notifyChannelUpdated(channel)
            logger.info("Channel '$channelName' edited.")
        } catch (ex: Exception) {
            logger.info("Editing channel '$channelName' failed: ${ex.message}")
        }*/
    }

    fun channelExistsByName(channelName: String): Boolean {
        /*configuredChannels.values.forEach { if(it.data.name == channelName) return true }
        return try {
            MySQL.exists(MySQL.tableChannels, "name = '$channelName'")
        } catch (ignored: Exception) {
            ignored.printStackTrace()
            false
        }*/
        return false
    }
    fun channelExistsByMount(mountpoint: String): Boolean {
        /*configuredChannels.values.forEach { if(it.data.mountpoint == mountpoint) return true }
        return try {
            MySQL.exists(MySQL.tableChannels, "mountpoint = '$mountpoint'")
        } catch (ignored: Exception) {
            false
        }*/
        return false
    }
    fun mysqlResultToChannel(result: ResultSet): Channel? {
        /*val genres = ArrayList<String>()
        val jsonArray = JsonParser().parse(result.getString("genres")).asJsonArray

        jsonArray?.forEach {
            genres.add(it.asString)
        }

        val dataPacket = ChannelDataPacket(
                result.getString("id"),
                result.getString("nodeID"),
                result.getString("name"),
                result.getString("description"),
                result.getString("creatorID"),
                result.getString("mountpoint"),
                result.getString("playlistID"),
                genres,
                result.getBoolean("featured"),
                result.getBoolean("listed"),
                result.getBoolean("playlistShuffle"),
                result.getBoolean("playlistLoop"),
                result.getInt("priority"),
                ChannelInfoPacket(result.getString("id"))
        )

        return Channel(dataPacket)*/
        return null
    }
    fun getChannelOnNodeByName(channelName: String): Channel? {
        /*val result = MySQL.get(MySQL.tableChannels, "nodeID = '${Filesystem.preferences.node.clientID}' AND name = '$channelName'", ArrayList(listOf("*")))

        return if(result != null && result.next()) {
            mysqlResultToChannel(result)
        } else {
            null
        }*/
        return null
    }
    private fun getChannelByNameLocally(channelName: String): Channel? {
        var channel: Channel? = null
        for(chan in configuredChannels.values){
            if(chan.data.name == channelName) {
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
        logger.info("Channel '${channel.data.name}' is ready")
    }

    override fun onChannelDone(channel: Channel) {
        if(restartTries.containsKey(channel.data.id)) {
            restartTries.remove(channel.data.id)
        }
    }

    fun resetRestartTries(channel: Channel){
        if(restartTries.containsKey(channel.data.id)) {
            restartTries.remove(channel.data.id)
        }
    }

    override fun onChannelStop(channel: Channel, reason: Int) {
        activeChannels.remove(channel.data.id)
        Thread.sleep(10)

        if(reason == REASON_CHANNEL_EXCEPTION && Filesystem.preferences.channels.autorestart) {
            // Restart channel
            var triesUsed = restartTries.getOrDefault(channel.data.id, 0)
            val delay: Long = (Filesystem.preferences.channels.restartDelay*1000).toLong()
            triesUsed += 1

            when {
                triesUsed == 1 -> {
                    logger.warn("Channel '${channel.data.name}' was shut down. Restarting it in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    restartTries[channel.data.id] = triesUsed
                    startChannel(channel.data.name)
                }
                triesUsed > Filesystem.preferences.channels.restartTries -> {
                    logger.error("Could not restart channel '${channel.data.name}' after ${triesUsed-1} tries.")
                    restartTries.remove(channel.data.id)
                }
                else -> {
                    // Execute with delay
                    logger.warn("Trying to restart channel '${channel.data.id}' in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    restartTries[channel.data.id] = triesUsed
                    startChannel(channel.data.name)
                }
            }
        } else {
            logger.info("Channel '${channel.data.name}' shut down.")
        }
    }

    override fun newThread(r: Runnable): Thread {
        return Thread(r, "channel-thread-${activeChannels.size+1}")
    }



    fun notifyChannelUpdated(channel: Channel){
        if(!configuredChannels.containsKey(channel.data.id)) {
            configuredChannels[channel.data.id] = channel

            if(Filesystem.preferences.channels.autostart) {
                startChannel(channel)
            }
            return
        }

        configuredChannels[channel.data.id]!!.liveUpdate(channel)
        if(activeChannels.containsKey(channel.data.id)) {
            activeChannels[channel.data.id]!!.liveUpdate(channel)
        }
    }

    fun notifyChannelRemoved(channelID: String){
        if(configuredChannels.containsKey(channelID)) configuredChannels.remove(channelID)
        if(activeChannels.containsKey(channelID)) {
            stopChannel(channelID, true)
        }
    }*/
}
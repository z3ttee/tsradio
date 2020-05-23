package live.tsradio.daemon.channel

import com.google.cloud.firestore.SetOptions
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.listener.ChannelEventListener
import live.tsradio.daemon.listener.REASON_CHANNEL_EXCEPTION
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.ThreadFactory
import kotlin.math.log

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
            activeChannels[channel.channelUUID] = channel
            executorService.execute(channel)
        }
    }
    fun startChannel(channelName: String) {
        val channel = getChannelByNameLocally(channelName) ?: return
        startChannel(configuredChannels[channel.channelUUID])
    }
    private fun stopChannel(channel: Channel?, forceStop: Boolean) {
        if(channel == null) {
            logger.warn("Cannot stop non-existent channel")
            return
        }

        channel.cancel(forceStop)
        channel.join()
    }
    fun stopChannel(channelName: String, forceStop: Boolean) {
        val channel = getChannelByNameLocally(channelName)?: return
        stopChannel(activeChannels[channel.channelUUID],forceStop)
    }
    fun restartChannel(channel: String) {
        stopChannel(channel, true)
        startChannel(channel)
    }
    private fun reloadChannel(channel: Channel?) {
        if(channel == null) {
            logger.warn("Cannot reload non-existent channel")
            return
        }

        channel.reload()
        logger.info("Channel '${channel.channelName}' reloaded.")
    }
    fun reloadChannel(channelName: String) {
        val channel = getChannelByNameLocally(channelName)?: return
        reloadChannel(activeChannels[channel.channelUUID])
    }

    fun createChannel(channel: Channel){
        try {
            Filesystem.getChannelCollection().document(channel.channelUUID).set(channel.toPOJO(), SetOptions.merge()).get()
            logger.info("Channel '${channel.channelName}' created.")
        } catch (ex: Exception) {
            logger.info("Creating channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun deleteChannel(channel: Channel) {
        try {
            if(isChannelActiveByUUID(channel.channelUUID)) {
                logger.info("Preparing channel '${channel.channelName}' for deletion.")
                channel.interrupt()
                channel.join()
                activeChannels.remove(channel.channelUUID)
            }

            configuredChannels.remove(channel.channelUUID)
            Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("channelUUID", channel.channelUUID).get().get().documents[0].reference.delete().get()
            logger.info("Channel '${channel.channelName}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun editChannel(channelName: String, channelUUID: String, channel: Channel) {
        try {
            Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("channelUUID", channelUUID).get().get().documents[0].reference.set(channel.toPOJO(), SetOptions.merge())
            logger.info("Channel '$channelName' edited.")
        } catch (ex: Exception) {
            logger.info("Editing channel '$channelName' failed: ${ex.message}")
        }
    }

    fun channelExistsByName(channelName: String): Boolean {
        configuredChannels.values.forEach { if(it.channelName == channelName) return true }
        return try {
            Filesystem.getChannelCollection().whereEqualTo("channelName", channelName).get().get().documents[0].exists()
        } catch (ignored: Exception) {
            false
        }
    }
    fun channelExistsByMount(mountpoint: String): Boolean {
        configuredChannels.values.forEach { if(it.mountpoint == mountpoint) return true }
        return try {
            Filesystem.getChannelCollection().whereEqualTo("mountpoint", mountpoint).get().get().documents[0].exists()
        } catch (ignored: Exception) {
            false
        }
    }
    fun getChannelByName(channelName: String): Channel {
        return getChannelByNameLocally(channelName)?: Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("channelName", channelName).get().get().documents[0].toObject(Channel.ChannelPOJO::class.java).toChannel()
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
    fun isChannelActiveByUUID(uuid: String): Boolean {
        return activeChannels.containsKey(uuid)
    }
    fun notifyPlaylistReceived(playlistName: String){
        for(channel in activeChannels.values){
            if(channel.playlistID == playlistName){
                channel.reload()
            }
        }
    }

    override fun onChannelReady(channel: Channel) {
        logger.info("Channel '${channel.channelName}' is ready")
    }

    override fun onChannelDone(channel: Channel) {
        if(restartTries.containsKey(channel.channelName)) {
            restartTries.remove(channel.channelName)
        }
    }

    override fun onChannelStop(channel: Channel, reason: Int) {
        activeChannels.remove(channel.channelName)
        Thread.sleep(10)

        if(reason == REASON_CHANNEL_EXCEPTION && Filesystem.preferences.channels.autorestart) {
            // Restart channel
            var triesUsed = restartTries.getOrDefault(channel.channelUUID, 0)
            val delay: Long = (Filesystem.preferences.channels.restartDelay*1000).toLong()
            triesUsed += 1

            when {
                triesUsed == 1 -> {
                    logger.warn("Channel '${channel.channelName}' was shut down. Restarting it in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    restartTries[channel.channelUUID] = triesUsed
                    startChannel(channel.channelName)
                }
                triesUsed > Filesystem.preferences.channels.restartTries -> {
                    logger.error("Could not restart channel '${channel.channelName}' after ${triesUsed-1} tries.")
                    restartTries.remove(channel.channelUUID)
                }
                else -> {
                    // Execute with delay
                    logger.warn("Trying to restart channel '${channel.channelName}' in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    restartTries[channel.channelUUID] = triesUsed
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
}
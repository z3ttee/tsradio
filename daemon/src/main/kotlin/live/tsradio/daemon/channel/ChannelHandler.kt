package live.tsradio.daemon.channel

import com.google.cloud.firestore.SetOptions
import live.tsradio.daemon.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object ChannelHandler {
    private val logger: Logger = LoggerFactory.getLogger(ChannelHandler::class.java)

    val configuredChannels: HashMap<String, Channel> = HashMap()
    val activeChannels: HashMap<String, Channel> = HashMap()

    fun startChannel(channel: Channel?) {
        if(channel == null) {
            logger.warn("Cannot start non-existent channel")
            return
        }

        if(activeChannels.size < Filesystem.preferences.channels.max) {
            channel.start()
            activeChannels[channel.channelName] = channel
        }
    }
    fun startChannel(channel: String) {
        startChannel(configuredChannels[channel])
    }
    private fun stopChannel(channel: Channel?) {
        if(channel == null) {
            logger.warn("Cannot stop non-existent channel")
            return
        }

        channel.interrupt()
        channel.join()
    }
    fun stopChannel(channel: String) {
        stopChannel(activeChannels[channel])
    }
    fun restartChannel(channel: String) {
        stopChannel(channel)
        startChannel(channel)
    }
    private fun reloadChannel(channel: Channel?) {
        if(channel == null) {
            logger.warn("Cannot reload non-existent channel")
            return
        }

        channel.reload()
    }
    fun reloadChannel(channel: String) {
        reloadChannel(activeChannels[channel])
    }

    fun createChannel(channel: Channel){
        try {
            Filesystem.getChannelCollection().document().set(channel.toPOJO(), SetOptions.merge()).get()
            logger.info("Channel '${channel.channelName}' created.")
        } catch (ex: Exception) {
            logger.info("Creating channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun deleteChannel(channel: Channel) {
        try {
            if(isChannelActiveByName(channel.channelName)) {
                logger.info("Preparing channel '${channel.channelName}' for deletion.")
                channel.interrupt()
                channel.join()
                activeChannels.remove(channel.channelName)

            }

            configuredChannels.remove(channel.channelName)
            Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("channelName", channel.channelName).get().get().documents[0].reference.delete().get()
            logger.info("Channel '${channel.channelName}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun editChannel(channelName: String, channel: Channel) {
        try {
            Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("channelName", channelName).get().get().documents[0].reference.set(channel.toPOJO(), SetOptions.merge())
            logger.info("Channel '$channelName' edited.")
        } catch (ex: Exception) {
            ex.printStackTrace()
            logger.info("Editing channel '$channelName' failed: ${ex.message}")
        }
    }

    fun channelExistsByName(channelName: String): Boolean {
        if(configuredChannels.containsKey(channelName)) return true
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
        return configuredChannels.getOrElse(channelName,  {
            return@getOrElse Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("channelName", channelName).get().get().documents[0].toObject(Channel.ChannelPOJO::class.java).toChannel()
        })
    }
    fun getChannelByMount(mountpoint: String): Channel {
        configuredChannels.values.forEach { if(it.mountpoint == mountpoint) return it }
        return Filesystem.getChannelCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("mountpoint", mountpoint).get().get().documents[0].toObject(Channel.ChannelPOJO::class.java).toChannel()
    }
    fun isChannelActiveByName(channelName: String): Boolean {
        return activeChannels.containsKey(channelName)
    }
    fun notifyPlaylistReceived(playlistName: String){
        for(channel in activeChannels.values){
            if(channel.playlistID == playlistName){
                channel.reload()
            }
        }
    }
}
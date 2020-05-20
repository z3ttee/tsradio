package live.tsradio.daemon.channel

import com.google.cloud.firestore.SetOptions
import live.tsradio.daemon.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object ChannelHandler {
    private val logger: Logger = LoggerFactory.getLogger(ChannelHandler::class.java)

    val configuredChannels: HashMap<String, Channel> = HashMap()
    val activeChannels: HashMap<String, Channel> = HashMap()

    fun startChannel(channel: Channel) {
        channel.start()
        activeChannels[channel.channelName] = channel
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
                configuredChannels.remove(channel.channelName)
            }

            Filesystem.getChannelCollection().whereEqualTo("channelName", channel.channelName).get().get().documents[0].reference.delete().get()
            logger.info("Channel '${channel.channelName}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting channel '${channel.channelName}' failed: ${ex.message}")
        }
    }

    fun editChannel(channelName: String, channel: Channel) {
        try {
            Filesystem.getChannelCollection().whereEqualTo("channelName", channelName).get().get().documents[0].reference.set(channel.toPOJO(), SetOptions.merge())
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
            return@getOrElse Filesystem.getChannelCollection().whereEqualTo("channelName", channelName).get().get().documents[0].toObject(Channel::class.java)
        })
    }
    fun getChannelByMount(mountpoint: String): Channel {
        configuredChannels.values.forEach { if(it.mountpoint == mountpoint) return it }
        return Filesystem.getChannelCollection().whereEqualTo("mountpoint", mountpoint).get().get().documents[0].toObject(Channel::class.java)
    }
    fun isChannelActiveByName(channelName: String): Boolean {
        return activeChannels.containsKey(channelName)
    }
}
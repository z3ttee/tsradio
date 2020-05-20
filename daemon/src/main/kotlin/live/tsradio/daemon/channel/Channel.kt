package live.tsradio.daemon.channel

import com.google.cloud.firestore.annotation.Exclude
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.sound.AudioTrack
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue

data class Channel(
    var nodeID: String = Filesystem.preferences.node.nodeID,
    var channelName: String = "unknown",
    var description: String = "Unknown description",
    var creator: String = "SYSTEM",
    var mountpoint: String = "",
    var playlistID: String = "",
    var shuffle: Boolean = true,
    var loop: Boolean = true,
    var genres: ArrayList<String> = ArrayList()
): Thread("channel-${channelName.toLowerCase()}") {

    @Exclude private val logger: Logger = LoggerFactory.getLogger(Channel::class.java)
    @Exclude var interruped: Boolean = false
    @Exclude val queue: BlockingQueue<AudioTrack> = LinkedBlockingQueue()

    override fun run() {
        logger.info("Starting channel '$name'")
        // TODO: Run channel
        // Connect to icecast

        // Load playlist

        // Start playing

        // Trigger stop event
        logger.info("Stopping channel '$name'")
    }

    override fun interrupt() {
        interruped = true
        logger.info("Channel shutdown triggered. Shutting down after current song was played.")
    }

    fun toPOJO(): ChannelPOJO {
        return ChannelPOJO(nodeID, channelName, description, creator, mountpoint, playlistID, shuffle, loop, genres)
    }

    fun liveUpdate(channel: Channel){
        nodeID = channel.nodeID
        channelName = channel.channelName
        description = channel.description
        creator = channel.creator
        mountpoint = channel.mountpoint
        playlistID = channel.playlistID
        shuffle = channel.shuffle
        loop = channel.loop
        genres = channel.genres
    }

    class ChannelPOJO {

        var nodeID: String = Filesystem.preferences.node.nodeID
        var channelName: String = "unknown"
        var description: String = "Unknown description"
        var creator: String = "SYSTEM"
        var mountpoint: String = ""
        var playlistID: String = ""
        var shuffle: Boolean = true
        var loop: Boolean = true
        var genres: ArrayList<String> = ArrayList()

        constructor()
        constructor(_nodeID: String, _channelName: String, _description: String, _creator: String, _mountpoint: String, _playlistID: String, _shuffle: Boolean, _loop: Boolean, _genres: ArrayList<String>) {
            this.nodeID = _nodeID
            this.channelName = _channelName
            this.description = _description
            this.creator = _creator
            this.mountpoint = _mountpoint
            this.playlistID = _playlistID
            this.shuffle = _shuffle
            this.loop = _loop
            this.genres = _genres
        }

        fun toChannel(): Channel {
            return Channel(nodeID, channelName, description, creator, mountpoint, playlistID, shuffle, loop, genres)
        }
    }
}
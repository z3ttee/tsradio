package live.tsradio.daemon.channel

import com.google.cloud.firestore.annotation.Exclude
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.listener.IcecastConnectionListener
import live.tsradio.daemon.protocol.IcecastClient
import live.tsradio.daemon.sound.AudioTrack
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.net.ConnectException
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
): Thread("channel-${channelName.toLowerCase()}"), IcecastConnectionListener {

    @Exclude private val logger: Logger = LoggerFactory.getLogger(Channel::class.java)
    @Exclude var interruped: Boolean = false
    @Exclude val queue: BlockingQueue<AudioTrack> = LinkedBlockingQueue()
    @Exclude val icecastClient: IcecastClient = IcecastClient(this, Filesystem.preferences.icecast, this)
    @Exclude val currentlyPlaying: AudioTrack? = null

    override fun run() {
        try {
            logger.info("Starting channel '$channelName'")
            // TODO: Run channel
            // Connect to icecast
            icecastClient.connect()

            // Load playlist

            logger.info("Channel '$channelName' ready.")
            // Start playing

            while (!interruped) {
                loadPlaylist()
                // Play
                if(queue.isEmpty()) logger.warn("Queue of channel '$channelName' is empty!")
                while(queue.isEmpty()) {
                    sleep(1000*5) // Scan every 5 sec, if queue was populated
                }

                logger.info("run(): playing...")
            }
        } catch (ex: Exception){
            if(ex !is ConnectException) {
                ex.printStackTrace()
            }
        } finally {
            logger.info("Stopping channel '$channelName'")
        }
    }

    override fun interrupt() {
        interruped = true
        logger.info("Channel shutdown triggered. Shutting down after current song was played.")
    }

    fun toPOJO(): ChannelPOJO {
        return ChannelPOJO(nodeID, channelName, description, creator, mountpoint, playlistID, shuffle, loop, genres)
    }

    fun reload(){
        logger.info("Reloading channel '$channelName'.")
        loadPlaylist()
    }

    fun loadPlaylist(){
        queue.clear()

        val playlist = PlaylistHandler.configuredPlaylists[playlistID]

        if(playlist == null) {
            logger.error("Could not find playlist '$playlistID' for channel '$channelName'.")
            return
        }

        if(!playlist.directoryAsFile.exists() || !playlist.directoryAsFile.isDirectory) {
            logger.error("Playlist directory '${playlist.directoryAsFile.absolutePath}' is not a directory or not found")
            return
        }


        //TODO: Load
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

        logger.info("liveUpdate(): updated channelName to '$channelName'")
    }

    override fun onConnectionEstablished() {
        logger.info("Channel '$channelName' connected to icecast2 successfully.")
    }

    override fun onConnectionError(exception: Exception) {
        var message = ""

        when (exception) {
            is ConnectException -> message = "Connection refused"
            else -> {
                exception.message!!
                exception.printStackTrace()
            }
        }

        logger.error("An error occured in channel '$channelName' whilst connecting to icecast2: $message")
        throw exception
    }

    override fun onConnectionLost() {
        logger.warn("Channel '$channelName' lost connection to icecast2.")
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
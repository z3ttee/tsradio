package live.tsradio.daemon.channel

import com.google.cloud.firestore.annotation.Exclude
import com.mpatric.mp3agic.Mp3File
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.listener.ChannelEventListener
import live.tsradio.daemon.listener.IcecastConnectionListener
import live.tsradio.daemon.listener.REASON_CHANNEL_EXCEPTION
import live.tsradio.daemon.listener.TrackEventListener
import live.tsradio.daemon.protocol.IcecastClient
import live.tsradio.daemon.sound.AudioTrack
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.net.ConnectException
import java.net.SocketException
import java.util.*
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

data class Channel(
    var nodeID: String = Filesystem.preferences.node.nodeID,
    var channelUUID: String = UUID.randomUUID().toString(),
    var channelName: String = "unknown",
    var description: String = "Unknown description",
    var creator: String = "SYSTEM",
    var mountpoint: String = "",
    var playlistID: String = "",
    var shuffle: Boolean = true,
    var loop: Boolean = true,
    var genres: ArrayList<String> = ArrayList()
): Thread("channel-${channelName.toLowerCase()}-${(1..4).map { (0..9).random() }.joinToString("")}"), IcecastConnectionListener, TrackEventListener {

    @Exclude private val logger: Logger = LoggerFactory.getLogger(Channel::class.java)
    @Exclude var shutdown: Boolean = false
    @Exclude var forceShutdown: Boolean = false
    @Exclude val queue: BlockingQueue<AudioTrack> = LinkedBlockingQueue()
    @Exclude val icecastClient: IcecastClient = IcecastClient(this, Filesystem.preferences.icecast, this, this)
    @Exclude var currentlyPlaying: AudioTrack? = null
    @Exclude var history: HashMap<Long, AudioTrack> = HashMap()
    @Exclude var channelEventListener: ChannelEventListener? = null


    override fun run() {
        try {
            logger.info("Starting channel '$channelName'")

            // Connect to icecast
            icecastClient.connect()
            channelEventListener?.onChannelReady(this)

            // Start playing
            while (!shutdown) {

                // Play
                if(queue.isEmpty()){
                    if(loop) loadPlaylist()
                    else logger.warn("Queue of channel '$channelName' is empty!")

                    if(queue.isEmpty()) {
                        if (Filesystem.preferences.channels.waitForQueue) {
                            logger.warn("Waiting till queue gets populated...")
                            while (queue.isEmpty()) {
                                sleep(1000 * 5) // Scan every 5 sec, if queue was populated
                            }
                        }
                    }
                }

                try {
                    val track = queue.random()
                    icecastClient.streamTrack(track)
                } catch (ignored: NullPointerException) {  }
            }

            channelEventListener?.onChannelDone(this)
            icecastClient.closeConnection()
            channelEventListener?.onChannelStop(this)
        } catch (ex: Exception){
            if(ex is ConnectException || ex is SocketException ) {
                // Do nothing
            } else {
                ex.printStackTrace()
            }

            icecastClient.closeConnection()
            channelEventListener?.onChannelStop(this, REASON_CHANNEL_EXCEPTION)
        }
    }

    fun cancel(forceStop: Boolean) {
        shutdown = true
        forceShutdown = forceStop

        when(forceStop) {
            true -> logger.info("Channel shutdown triggered.")
            else -> logger.info("Channel shutdown triggered. Shutting down after current song was played.")
        }
    }

    fun toPOJO(): ChannelPOJO {
        return ChannelPOJO(nodeID, channelUUID, channelName, description, creator, mountpoint, playlistID, shuffle, loop, genres)
    }

    fun reload(){
        loadPlaylist()
    }

    private fun loadPlaylist(withLogEntries: Boolean = true){
        queue.clear()

        val playlist = PlaylistHandler.configuredPlaylists[playlistID]

        if(playlist == null) {
            if(withLogEntries) logger.error("Could not find playlist '$playlistID' for channel '$channelName'.")
            return
        }

        if(!playlist.directoryAsFile.exists() || !playlist.directoryAsFile.isDirectory) {
            if(withLogEntries) logger.error("Playlist directory '${playlist.directoryAsFile.absolutePath}' is not a directory or not found")
            return
        }

        playlist.directoryAsFile.listFiles { _, name -> name.endsWith(".mp3") }!!.forEach { file ->
            val mp3File = Mp3File(file)

            var title = ""
            var artist = ""

            try {
                if(mp3File.hasId3v1Tag()) {
                    title = mp3File.id3v1Tag.title?: "Unknown title"
                    artist = mp3File.id3v1Tag.artist?: "Unknown artist"
                } else if(mp3File.hasId3v2Tag()) {
                    title = mp3File.id3v2Tag.title?: "Unknown title"
                    artist = mp3File.id3v2Tag.artist?: "Unknown artist"
                }
            } catch (ignored: IllegalStateException){
                if(withLogEntries) logger.warn("Found song file with corrupted Id3v2/v1 Tags ('${file.absolutePath}')")
            }

            val track = AudioTrack(title, artist, file, mp3File)
            queue.offer(track)
        }
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
                message = exception.message!!
                exception.printStackTrace()
            }
        }

        logger.error("An error occured in channel '$channelName' whilst connecting to icecast2: $message")
        throw exception
    }

    override fun onConnectionLost() {
        logger.warn("Channel '$channelName' lost connection to icecast2.")
    }

    override fun onTrackStart(track: AudioTrack) {
        currentlyPlaying = track
    }

    override fun onTrackEnd(track: AudioTrack, endReason: Int, exception: Exception?) {
        currentlyPlaying = null
        history[System.currentTimeMillis()] = track

        if(exception != null){
            when (exception) {
                is SocketException -> {
                    logger.error("Connection closed: ${exception.message}")
                    throw exception
                }
                else -> exception.printStackTrace()
            }

        }
    }

    class ChannelPOJO {

        var nodeID: String = Filesystem.preferences.node.nodeID
        var channelUUID: String = UUID.randomUUID().toString()
        var channelName: String = "unknown"
        var description: String = "Unknown description"
        var creator: String = "SYSTEM"
        var mountpoint: String = ""
        var playlistID: String = ""
        var shuffle: Boolean = true
        var loop: Boolean = true
        var genres: ArrayList<String> = ArrayList()

        constructor()
        constructor(_nodeID: String, _channelUUID: String, _channelName: String, _description: String, _creator: String, _mountpoint: String, _playlistID: String, _shuffle: Boolean, _loop: Boolean, _genres: ArrayList<String>) {
            this.nodeID = _nodeID
            this.channelUUID = _channelUUID
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
            return Channel(nodeID, channelUUID, channelName, description, creator, mountpoint, playlistID, shuffle, loop, genres)
        }
    }
}
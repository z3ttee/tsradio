package live.tsradio.daemon.channel

import com.mpatric.mp3agic.Mp3File
import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.exception.StreamException
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.listener.*
import live.tsradio.daemon.protocol.IcecastClient
import live.tsradio.daemon.sound.AudioTrack
import live.tsradio.daemon.sound.PlaylistHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.FileNotFoundException
import java.net.ConnectException
import java.net.SocketException
import java.util.*
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

data class Channel(
    var nodeID: String = Filesystem.preferences.node.nodeID,
    var channelID: String = UUID.randomUUID().toString(),
    var channelName: String = "unknown",
    var description: String = "Unknown description",
    var creatorID: String = "SYSTEM",
    var mountpoint: String = "",
    var playlistID: String = "",
    var shuffle: Boolean = true,
    var loop: Boolean = true,
    var genres: ArrayList<String> = ArrayList()
): Thread("channel-${channelName.toLowerCase()}-${(1..4).map { (0..9).random() }.joinToString("")}"), IcecastConnectionListener, TrackEventListener {

    private val logger: Logger = LoggerFactory.getLogger(Channel::class.java)
    var shutdown: Boolean = false
    var forceShutdown: Boolean = false
    val queue: BlockingQueue<AudioTrack> = LinkedBlockingQueue()
    val icecastClient: IcecastClient = IcecastClient(this, Filesystem.preferences.icecast, this, this)
    var channelInfo: ChannelInfo = ChannelInfo(this, AudioTrack("Nothing", "Nothing", null, null), HashMap())
    var channelEventListener: ChannelEventListener? = null

    override fun run() {
        try {
            channelInfo.clearTrack()
            logger.info("Starting channel '$channelName'")

            // Connect to icecast
            icecastClient.connect()
            channelEventListener?.onChannelReady(this)

            // Start playing
            while (!shutdown) {

                // Play
                if(queue.isEmpty()){
                    if(loop) loadPlaylist()

                    if(queue.isEmpty()) {
                        if (Filesystem.preferences.channels.waitForQueue) {
                            logger.warn("Waiting till queue gets populated...")
                            while (queue.isEmpty() && !shutdown) {
                                sleep(1000 * 1) // Check every sec, if queue was populated
                            }
                        }
                    }
                }

                if(!shutdown) {
                    try {
                        val track = queue.random()
                        icecastClient.streamTrack(track)
                    } catch (ignored: NullPointerException) {
                    }
                }
            }

            channelEventListener?.onChannelDone(this)
            icecastClient.closeConnection()
            channelEventListener?.onChannelStop(this)
        } catch (ex: Exception){
            channelEventListener?.onChannelDone(this)

            if(ex is ConnectException || ex is SocketException) {
                // Do nothing
                return
            } else {
                if(ex is StreamException) {
                    logger.error("An error occured: ${ex.message}")
                } else {
                    ex.printStackTrace()
                }

                onConnectionError(ex)
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
            if(!playlist.directoryAsFile.mkdirs()) {
                if (withLogEntries) logger.error("Playlist directory '${playlist.directoryAsFile.absolutePath}' is not a directory or not found")
                return
            }
        }

        playlist.directoryAsFile.listFiles { _, name -> name.endsWith(".mp3") }!!.forEach { file ->
            var mp3File: Mp3File? = null
            try {
                mp3File = Mp3File(file)
            } catch (ex: FileNotFoundException) {
                logger.error("'$channelName' >> Could not load file: ${ex.message}")
            }

            if(mp3File != null) {
                var title = ""
                var artist = ""

                try {
                    if (mp3File.hasId3v1Tag()) {
                        title = mp3File.id3v1Tag.title ?: "Unknown title"
                        artist = mp3File.id3v1Tag.artist ?: "Unknown artist"
                    } else if (mp3File.hasId3v2Tag()) {
                        title = mp3File.id3v2Tag.title ?: "Unknown title"
                        artist = mp3File.id3v2Tag.artist ?: "Unknown artist"
                    }
                } catch (ignored: IllegalStateException) {
                    if (withLogEntries) logger.warn("'$channelName' >> Found song file with corrupted Id3v2/v1 Tags ('${file.absolutePath}')")
                }

                val track = AudioTrack(title, artist, file, mp3File)
                queue.offer(track)
            }
        }
    }

    fun liveUpdate(channel: Channel){
        if(playlistID != channel.playlistID) {
            // Playlist updated -> reload
            loadPlaylist(false)
        }

        nodeID = channel.nodeID
        channelName = channel.channelName
        description = channel.description
        creatorID = channel.creatorID
        mountpoint = channel.mountpoint
        playlistID = channel.playlistID
        shuffle = channel.shuffle
        loop = channel.loop
        genres = channel.genres

        logger.info("live updated.")
    }

    fun toContentValues(): ContentValues {
        val values = ContentValues()
        values["id"] = channelID.replace("-", "")
        values["name"] = channelName
        values["nodeID"] = nodeID.replace("-", "")
        values["description"] = description
        values["creatorID"] = creatorID.replace("-", "")
        values["mountpoint"] = "/${(mountpoint.removePrefix("/").removeSuffix("/").replace("/", "").replace("\\", ""))}"
        values["playlistID"] = playlistID.replace("-", "")
        values["playlistShuffle"] = when(shuffle) {
            true -> "1"
            else -> "0"
        }
        values["playlistLoop"] = when(loop) {
            true -> "1"
            else -> "0"
        }
        values["genres"] = genres.joinToString(";")

        return values
    }

    override fun onConnectionEstablished() {
        logger.info("Channel '$channelName' connected to icecast2 successfully.")
    }

    override fun onConnectionError(exception: Exception) {
        val message: String

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
        channelInfo.currentTrack = track
        channelInfo.update()
    }

    override fun onTrackEnd(track: AudioTrack, endReason: Int, exception: Exception?) {
        channelInfo.clearTrack()
        channelInfo.addToHistory(track)

        if(endReason != REASON_MAY_START_NEXT || exception != null){
            channelInfo.update()
        }

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
}
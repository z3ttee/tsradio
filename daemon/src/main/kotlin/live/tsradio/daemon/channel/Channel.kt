package live.tsradio.daemon.channel

import com.google.gson.GsonBuilder
import com.mpatric.mp3agic.Mp3File
import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.exception.StreamException
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.listener.*
import live.tsradio.daemon.protocol.IcecastClient
import live.tsradio.daemon.protocol.packets.ChannelDataPacket
import live.tsradio.daemon.sound.AudioTrack
import live.tsradio.daemon.sound.PlaylistHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.FileNotFoundException
import java.net.ConnectException
import java.net.SocketException
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

class Channel(
        var data: ChannelDataPacket
): Thread("channel-${data.name}-${(1..4).map { (0..9).random() }.joinToString("")}"), IcecastConnectionListener, TrackEventListener {

    private val logger: Logger = LoggerFactory.getLogger(Channel::class.java)

    var shutdown: Boolean = false
    var forceShutdown: Boolean = false
    val queue: ArrayList<AudioTrack> = ArrayList()
    val icecastClient: IcecastClient = IcecastClient(this, Filesystem.preferences.icecast, this, this)
    var channelEventListener: ChannelEventListener? = null

    override fun run() {
        try {
            data.info.clearAll()
            logger.info("Starting channel '${data.name}'")

            // Connect to icecast
            icecastClient.connect()

            channelEventListener?.onChannelReady(this)

            // Start playing
            while (!shutdown) {

                // Play
                if(queue.isEmpty()){
                    if(data.looped) loadPlaylist()

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
                        val rnd = Random().nextInt(queue.size)

                        val track = queue.removeAt(rnd)
                        icecastClient.streamTrack(track)
                        ChannelHandler.resetRestartTries(this)
                    } catch (ignored: NullPointerException) {
                    }
                }
            }

            channelEventListener?.onChannelDone(this)
            icecastClient.closeConnection()
            channelEventListener?.onChannelStop(this)
        } catch (ex: Exception){
            if(ex is ConnectException || ex is SocketException) {
                // Do nothing
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

        val playlist = PlaylistHandler.configuredPlaylists[data.playlistID]

        if(playlist == null) {
            if(withLogEntries) logger.error("Could not find playlist '${data.playlistID}' for channel '${data.name}'.")
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
                logger.error("'${data.name}' >> Could not load file: ${ex.message}")
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
                    if (withLogEntries) logger.warn("'${data.name}' >> Found song file with corrupted Id3v2/v1 Tags ('${file.absolutePath}')")
                }

                val track = AudioTrack(title, artist, file, mp3File)
                queue.add(track)
            }
        }
    }

    fun liveUpdate(channel: Channel){
        if(data.playlistID != channel.data.playlistID) {
            // Playlist updated -> reload
            loadPlaylist(false)
        }

        this.data = channel.data
        logger.info("live updated.")
    }

    fun toContentValues(): ContentValues {
        val values = ContentValues()
        values["id"] = data.id.replace("-", "")
        values["name"] = data.name
        values["nodeID"] = data.nodeID.replace("-", "")
        values["description"] = data.description
        values["creatorID"] = data.creatorID.replace("-", "")
        values["mountpoint"] = "/${(data.mountpoint.removePrefix("/").removeSuffix("/").replace("/", "").replace("\\", ""))}"
        values["playlistID"] = data.playlistID.replace("-", "")
        values["playlistShuffle"] = when(data.shuffled) {
            true -> "1"
            else -> "0"
        }
        values["playlistLoop"] = when(data.looped) {
            true -> "1"
            else -> "0"
        }
        values["genres"] = "["+GsonBuilder().create().toJson(data.genres)+"]"

        return values
    }

    override fun onConnectionEstablished() {
        logger.info("Channel '${data.name}' connected to icecast2 successfully.")
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

        logger.error("An error occured in channel '${data.name}' whilst connecting to icecast2: $message")
        throw exception
    }

    override fun onConnectionLost() {
        logger.warn("Channel '${data.name}' lost connection to icecast2.")
    }

    override fun onTrackStart(track: AudioTrack) {
        data.info.title = track.title
        data.info.artist = track.artist
        data.info.triggerUpdate()
    }

    override fun onTrackEnd(track: AudioTrack, endReason: Int, exception: Exception?) {
        data.info.addToHistory(track)

        if(endReason != REASON_MAY_START_NEXT || exception != null){
            data.info.clearAll()
            data.info.triggerUpdate()
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
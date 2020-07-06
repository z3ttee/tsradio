package live.tsradio.nodeserver.channel

import com.mpatric.mp3agic.Mp3File
import live.tsradio.nodeserver.exception.StreamException
import live.tsradio.nodeserver.files.Filesystem
import live.tsradio.nodeserver.events.audio.IcecastConnectionListener
import live.tsradio.nodeserver.events.channel.ChannelEventListener
import live.tsradio.nodeserver.handler.ChannelHandler
import live.tsradio.nodeserver.icecast.IcecastClient
import live.tsradio.nodeserver.api.audio.AudioTrack
import live.tsradio.nodeserver.api.node.channel.NodeChannel
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileNotFoundException
import java.net.ConnectException
import java.net.SocketException
import java.util.*
import java.util.concurrent.ExecutorService
import kotlin.collections.ArrayList

class Channel(
        var data: NodeChannel
): Thread("channel-${data.name}-${(1..4).map { (0..9).random() }.joinToString("")}") {
    private val logger: Logger = LoggerFactory.getLogger(Channel::class.java)

    var isRunning: Boolean = false
    var shutdown: Boolean = false
    var queue: ArrayList<AudioTrack> = ArrayList()
    var icecastClient: IcecastClient = IcecastClient(this)

    fun execute(executorService: ExecutorService) {
        executorService.execute {

            try {
                data.info?.clear()
                logger.info("Starting channel '${data.name}'")

                icecastClient.connect()
                ChannelEventListener.onChannelReady(this)

                while (!shutdown) {
                    if (queue.isEmpty() && data.looped && !loadPlaylist()) {
                        logger.error("Queue for channel '${data.name}' is empty. Nothing found to play!")
                        break
                    }

                    try {
                        val rnd = Random().nextInt(queue.size)
                        val track = queue.removeAt(rnd)
                        icecastClient.streamTrack(track)
                        ChannelHandler.restartTries.remove(data.id)
                    } catch (ignored: NullPointerException) {
                    }
                }

                ChannelEventListener.onChannelDone(data)
                icecastClient.closeConnection()
                ChannelEventListener.onChannelStop(this)
            } catch (ex: Exception) {
                if(ex is ConnectException || ex is SocketException) {
                    // Do nothing
                } else {
                    if(ex is StreamException) {
                        logger.error("An error occured: ${ex.message}")
                    } else {
                        ex.printStackTrace()
                    }

                    IcecastConnectionListener.onConnectionError(ex)
                }

                icecastClient.closeConnection()
                ChannelEventListener.onChannelStop(this, ChannelEventListener.REASON_CHANNEL_EXCEPTION)
            }
        }
    }

    fun shutdown(){
        this.shutdown = true
    }

    fun loadPlaylist(): Boolean {
        queue.clear()
        val playlist = data.playlist ?: return false
        val directory = File(Filesystem.playlistDirectory.absolutePath+ File.separator+playlist.id)

        if(!directory.exists() || !directory.isDirectory) {
            if(!directory.mkdirs()) {
                logger.error("Playlist directory '${directory.absolutePath}' is not a directory or cannot be found")
                return false
            }
        }

        directory.listFiles { _, name -> name.endsWith(".mp3") }!!.forEach { file ->
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
                    logger.warn("'${data.name}' >> Found song file with corrupted Id3v2/v1 Tags ('${file.absolutePath}')")
                }

                val track = AudioTrack(title, artist, file, mp3File)
                queue.add(track)
            }
        }

        return queue.isNotEmpty()
    }
}
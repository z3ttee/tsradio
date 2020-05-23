package live.tsradio.daemon.protocol

import com.github.kevinsawicki.http.HttpRequest
import com.google.common.io.LineReader
import live.tsradio.daemon.channel.Channel
import live.tsradio.daemon.exception.StreamException
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.files.PreferenceSections
import live.tsradio.daemon.listener.IcecastConnectionListener
import live.tsradio.daemon.listener.REASON_EXCEPTION
import live.tsradio.daemon.listener.REASON_MAY_START_NEXT
import live.tsradio.daemon.listener.TrackEventListener
import live.tsradio.daemon.sound.AudioTrack
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.*
import java.net.Socket

class IcecastClient(
        val channel: Channel,
        val icecastSettings: PreferenceSections.IcecastSettings,
        val connectionListener: IcecastConnectionListener,
        val trackEventListener: TrackEventListener
) {

    private val logger: Logger = LoggerFactory.getLogger(IcecastClient::class.java)
    var socket: Socket? = null
    var outputStream: OutputStream? = null

    fun isConnected(): Boolean {
        return socket != null && !socket?.isClosed!!
    }

    // TODO: Handle https requests
    fun connect(){
        try {
            this.socket = Socket(icecastSettings.host, icecastSettings.port)
            this.outputStream = socket!!.getOutputStream()

            val outWriter = PrintWriter(outputStream!!, false)
            val inputStream = socket!!.getInputStream()

            // send an HTTP request to the web server
            outWriter.println(String.format("SOURCE %s HTTP/1.0", channel.mountpoint))
            outWriter.println(
                    String.format(
                            "Authorization: Basic %s",
                            HttpRequest.Base64.encode("${icecastSettings.sourceUsername}:${icecastSettings.sourcePassword}")
                    )
            )
            outWriter.println("User-Agent: libshout/2.3.1")
            outWriter.println(String.format("Content-Type: %s", MimeType.mp3.contentType))
            outWriter.println(String.format("ice-name: %s", channel.channelName))
            outWriter.println("ice-public: 0")
            outWriter.println(String.format("ice-description: %s", channel.description))
            outWriter.println()
            outWriter.flush()

            val lineReader = LineReader(InputStreamReader(inputStream))
            val data = lineReader.readLine()
            handleResponse(data)

            connectionListener.onConnectionEstablished()
        } catch (ex: Exception) {
            connectionListener.onConnectionError(ex)
        }
    }

    fun streamTrack(track: AudioTrack) {
        val bufferSize = (track.mp3File.length.toDouble() / track.mp3File.lengthInSeconds).toLong().toInt() + 1
        val buffer = ByteArray(bufferSize)
        val inputStream = FileInputStream(track.file)

        try {
            // mainloop, write every specified size, reduce syscall
            trackEventListener.onTrackStart(track)
            while (!channel.forceShutdown) {
                //TODO: Test if errors occur without that code
                /*if(!isConnected()) {
                    connect()
                    Thread.sleep(1000*Filesystem.preferences.channels.restartDelayBetween)
                }*/

                val read = inputStream.read(buffer, 0, bufferSize)
                // EOF
                if (read < 0) {
                    break
                } else {
                    outputStream!!.write(buffer, 0, read)
                    outputStream!!.flush()
                }

                try {
                    Thread.sleep(1000)
                } catch (e: InterruptedException) {
                    // skip
                }
            }
            trackEventListener.onTrackEnd(track, REASON_MAY_START_NEXT, null)
        } catch (e: Exception) {
            try {
                inputStream.close()
            } catch (ignored: IOException) { }
            trackEventListener.onTrackEnd(track, REASON_EXCEPTION, e)
        }
    }

    fun closeConnection(){
        socket?.close()
        connectionListener.onConnectionLost()
    }

    fun refreshConnection(){
        closeConnection()
        connect()
    }

    private fun handleResponse(data: String) {
        if (data.startsWith("HTTP/1.0 401")) {
            throw StreamException("auth error! check username and password")
        } else if (data.startsWith("HTTP/1.0 403 Forbidden")) {
            throw StreamException("invalid operation! this stream is already streaming!")
        } else {
            if (!data.startsWith("HTTP/1.0 200")) {
                throw StreamException("unknown exception! $data")
            }
        }
    }

}
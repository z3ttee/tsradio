package live.tsradio.nodeserver.icecast

import com.github.kevinsawicki.http.HttpRequest
import com.google.common.io.LineReader
import live.tsradio.nodeserver.api.node.channel.NodeChannel
import live.tsradio.nodeserver.events.audio.IcecastConnectionListener
import live.tsradio.nodeserver.events.audio.TrackEventListener
import live.tsradio.nodeserver.exception.StreamException
import live.tsradio.nodeserver.files.Filesystem
import live.tsradio.nodeserver.api.audio.AudioTrack
import java.io.*
import java.net.Socket

class IcecastClient(val channel: NodeChannel) {

    var socket: Socket? = null
    var outputStream: OutputStream? = null

    // TODO: Handle https requests
    fun connect(){
        try {
            this.socket = Socket(Filesystem.preferences.icecast.host, Filesystem.preferences.icecast.port)
            this.outputStream = socket!!.getOutputStream()

            val outWriter = PrintWriter(outputStream!!, false)
            val inputStream = socket!!.getInputStream()

            // send an HTTP request to the web server
            outWriter.println(String.format("SOURCE %s HTTP/1.0", channel.mountpoint))
            outWriter.println(
                    String.format(
                            "Authorization: Basic %s",
                            HttpRequest.Base64.encode("${Filesystem.preferences.icecast.sourceUsername}:${Filesystem.preferences.icecast.sourcePassword}")
                    )
            )
            outWriter.println("User-Agent: libshout/2.3.1")
            outWriter.println(String.format("Content-Type: %s", MimeType.mp3.contentType))
            outWriter.println(String.format("ice-name: %s", channel.name))
            outWriter.println("ice-public: 0")
            outWriter.println(String.format("ice-description: %s", channel.name))
            outWriter.println()
            outWriter.flush()

            val lineReader = LineReader(InputStreamReader(inputStream))
            val data = lineReader.readLine()
            handleResponse(data)

            IcecastConnectionListener.onConnectionEstablished()
        } catch (ex: Exception) {
            IcecastConnectionListener.onConnectionError(ex)
        }
    }

    fun streamTrack(track: AudioTrack) {
        val bufferSize = (track.mp3File!!.length.toDouble() / track.mp3File.lengthInSeconds).toLong().toInt() + 1
        val buffer = ByteArray(bufferSize)
        val inputStream = FileInputStream(track.file!!)

        try {
            // mainloop, write every specified size, reduce syscall
            TrackEventListener.onTrackStart(channel, track)
            while (!channel.shutdown) {

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
            TrackEventListener.onTrackEnd(channel, track, TrackEventListener.REASON_MAY_START_NEXT, null)
        } catch (e: Exception) {
            try {
                inputStream.close()
            } catch (ignored: IOException) { }
            TrackEventListener.onTrackEnd(channel, track, TrackEventListener.REASON_EXCEPTION, e)
        }
    }

    fun closeConnection(){
        socket?.close()
        outputStream?.close()
        IcecastConnectionListener.onConnectionLost()
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
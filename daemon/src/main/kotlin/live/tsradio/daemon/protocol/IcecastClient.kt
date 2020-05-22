package live.tsradio.daemon.protocol

import com.github.kevinsawicki.http.HttpRequest
import live.tsradio.daemon.channel.Channel
import live.tsradio.daemon.files.PreferenceSections
import live.tsradio.daemon.listener.IcecastConnectionListener
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.OutputStream
import java.io.PrintWriter
import java.net.Socket

class IcecastClient(val channel: Channel, val icecastSettings: PreferenceSections.IcecastSettings, val connectionListener: IcecastConnectionListener) {

    private val logger: Logger = LoggerFactory.getLogger(IcecastClient::class.java)
    var socket: Socket? = null
    var outputStream: OutputStream? = null

    fun isConnected(): Boolean {
        return socket != null && !socket?.isClosed!!
    }

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

            connectionListener.onConnectionEstablished()
        } catch (ex: Exception) {
            connectionListener.onConnectionError(ex)
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

}
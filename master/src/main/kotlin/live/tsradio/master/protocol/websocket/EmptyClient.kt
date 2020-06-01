package live.tsradio.master.protocol.websocket

import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import java.lang.Exception
import java.net.URI
import java.nio.ByteBuffer

fun main() {
    val client = EmptyClient(URI("ws://localhost:1488"))
    client.connect()
}

class EmptyClient(serverUri: URI): WebSocketClient(serverUri) {


    override fun onOpen(handshakedata: ServerHandshake?) {
        send("Hello, it is me. Mario :)")
        println("new connection opened")
    }

    override fun onClose(code: Int, reason: String?, remote: Boolean) {
        println("closed with exit code $code additional info: $reason")
    }

    override fun onMessage(message: String?) {
        println("received message: $message")
    }
    override fun onMessage(message: ByteBuffer) {
        println("received ByteBuffer");
    }

    override fun onError(ex: Exception?) {
        System.err.println("an error occurred:$ex")
    }

}
package live.tsradio.dataserver

import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory


private val logger: Logger = LoggerFactory.getLogger(Client::class.java)

fun main(args: Array<String>) {
    val socket = IO.socket("http://localhost:9092")
    socket.on(Socket.EVENT_CONNECT) {
        val jsonObject = JSONObject()
        jsonObject.put("userName", "Jan Cas")
        jsonObject.put("message", "Default, bin beigetreten, ka cke")

        socket.emit("chatevent", jsonObject)
    }

    socket.connect()
}

class Client {

}
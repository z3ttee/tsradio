package live.tsradio.dataserver

import com.corundumstudio.socketio.Configuration
import com.corundumstudio.socketio.SocketIOServer
import com.corundumstudio.socketio.listener.DataListener
import live.tsradio.dataserver.listener.OnChannelDataListener
import live.tsradio.dataserver.listener.OnChatListener
import live.tsradio.dataserver.listener.OnConnectListener
import live.tsradio.dataserver.listener.OnDisconnectListener
import org.json.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory

private val logger: Logger = LoggerFactory.getLogger(ChatObject::class.java)

fun main(args: Array<String>) {
    val config = Configuration()
    config.hostname = "localhost"
    config.port = 9092

    /*val server = SocketIOServer(config)
    server.addEventListener("chatevent", ChatObject::class.java, DataListener { client, data, ackSender ->
        logger.info(client.toString() + data)
        server.broadcastOperations.sendEvent("chatevent", data)
    })
    server.addConnectListener(OnConnectListener())*/

    Server(config)
}

class Server(config: Configuration) {
    private val logger: Logger = LoggerFactory.getLogger(Server::class.java)

    companion object {
        var server = SocketIOServer(Configuration())
    }

    init {
        server = SocketIOServer(config)
        server.addConnectListener(OnConnectListener())
        server.addDisconnectListener(OnDisconnectListener())
        server.addEventListener("msg", ByteArray::class.java, OnChannelDataListener())
        server.addEventListener("chatevent", ChatObject::class.java, OnChatListener())

        server.startAsync()
        Thread.currentThread().join()
    }
}
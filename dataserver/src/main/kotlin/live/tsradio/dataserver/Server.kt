package live.tsradio.dataserver

import com.corundumstudio.socketio.Configuration
import com.corundumstudio.socketio.SocketIOServer
import live.tsradio.dataserver.api.MovingClient
import live.tsradio.dataserver.database.MySQL
import live.tsradio.dataserver.listener.channel.OnChannelInfoListener
import live.tsradio.dataserver.listener.channel.OnChannelUpdateListener
import live.tsradio.dataserver.listener.client.OnClientConnectListener
import live.tsradio.dataserver.listener.client.OnClientDisconnectListener
import live.tsradio.dataserver.listener.client.OnClientMoveListener
import live.tsradio.dataserver.utils.CMDInputFinder
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileInputStream
import kotlin.collections.ArrayList

private val logger: Logger = LoggerFactory.getLogger(Server::class.java)

fun main(args: Array<String>) {
    val config = Configuration()
    config.hostname = "localhost"
    config.port = 9092

    val password = CMDInputFinder(args.toCollection(ArrayList())).findValue("keystorepw", true)
    config.keyStorePassword = password

    val fileInput = FileInputStream(File(System.getProperty("user.dir"), "keystore.jks"))
    config.keyStore = fileInput// Server::class.java.getResourceAsStream("/sslKeystore.jks")

    Server(config)
}

class Server(config: Configuration) {
    private val logger: Logger = LoggerFactory.getLogger(Server::class.java)

    companion object {
        var server = SocketIOServer(Configuration())
    }

    init {
        MySQL

        server = SocketIOServer(config)
        server.addConnectListener(OnClientConnectListener())
        server.addDisconnectListener(OnClientDisconnectListener())

        server.addEventListener("onChannelUpdate", String::class.java, OnChannelUpdateListener())
        server.addEventListener("onChannelInfoUpdate", String::class.java, OnChannelInfoListener())

        // Client movement events
        server.addEventListener("onChannelMove", MovingClient::class.java, OnClientMoveListener())

        server.startAsync()
        Thread.currentThread().join()
    }
}
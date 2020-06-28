package live.tsradio.dataserver

import com.corundumstudio.socketio.Configuration
import com.corundumstudio.socketio.SocketIOChannelInitializer
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.SocketIOServer
import com.corundumstudio.socketio.listener.ExceptionListener
import io.netty.channel.Channel
import io.netty.channel.ChannelHandlerContext
import live.tsradio.dataserver.api.MovingClient
import live.tsradio.dataserver.database.MySQL
import live.tsradio.dataserver.files.Filesystem
import live.tsradio.dataserver.listener.channel.OnChannelInfoListener
import live.tsradio.dataserver.listener.channel.OnChannelUpdateListener
import live.tsradio.dataserver.listener.client.OnClientConnectListener
import live.tsradio.dataserver.listener.client.OnClientDisconnectListener
import live.tsradio.dataserver.listener.client.OnClientMoveListener
import live.tsradio.dataserver.utils.CMDInputFinder
import live.tsradio.dataserver.utils.CertGenerator
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileInputStream
import java.lang.Exception
import kotlin.collections.ArrayList

private val logger: Logger = LoggerFactory.getLogger(Server::class.java)

fun main(args: Array<String>) {
    val config = Configuration()

    config.hostname = Filesystem.preferences.dataserver.host
    config.port = Filesystem.preferences.dataserver.port

    if(Filesystem.preferences.dataserver.ssl) {
        logger.info("SSL enabled. Using certificate in keystore file")
        val password = CMDInputFinder(args.toCollection(ArrayList())).findValue("keystorepw", true)
        config.keyStorePassword = password

        val keystoreFile = File(System.getProperty("user.dir"), "keystore.jks");

        if(!keystoreFile.exists()) {
            // Start cert setup
            val certGenerator = CertGenerator()
            certGenerator.fetchCertificate(ArrayList(listOf("streams.tsradio.live")))
        }

        val fileInput = FileInputStream(keystoreFile)
        config.keyStore = fileInput
    }

    config.exceptionListener = Server.ExceptionListener()
    Server(config)
}

class Server(config: Configuration) {
    private val logger: Logger = LoggerFactory.getLogger(Server::class.java)

    companion object {
        var server = SocketIOServer(Configuration())
    }

    init {
        logger.info("Starting dataserver...")
        logger.info(config.origin)

        MySQL

        server = SocketIOServer(config)

        server.addConnectListener(OnClientConnectListener())
        server.addDisconnectListener(OnClientDisconnectListener())

        server.addEventListener("onChannelUpdate", String::class.java, OnChannelUpdateListener())
        server.addEventListener("onChannelInfoUpdate", String::class.java, OnChannelInfoListener())

        // Client movement events
        server.addEventListener("onChannelMove", MovingClient::class.java, OnClientMoveListener())

        server.start()
    }


    class ExceptionListener: com.corundumstudio.socketio.listener.ExceptionListener {
        override fun onConnectException(e: Exception?, client: SocketIOClient?) {
            if(e != null) throw e
        }

        override fun onEventException(e: Exception?, args: MutableList<Any>?, client: SocketIOClient?) {
            if(e != null) throw e
        }

        override fun onDisconnectException(e: Exception?, client: SocketIOClient?) {
            if(e != null) throw e
        }

        override fun exceptionCaught(ctx: ChannelHandlerContext?, e: Throwable?): Boolean {
            if(e != null) throw e
            else return true
        }

    }
}
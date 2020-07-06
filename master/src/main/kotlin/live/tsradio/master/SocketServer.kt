package live.tsradio.master

import com.corundumstudio.socketio.Configuration
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.SocketIOServer
import com.corundumstudio.socketio.listener.ExceptionListener
import io.netty.channel.ChannelHandlerContext
import live.tsradio.master.events.client.OnClientConnectionEvent
import live.tsradio.master.events.client.OnClientDisconnectEvent
import live.tsradio.master.events.node.OnNodeChannelInfoUpdateEvent
import live.tsradio.master.events.node.OnNodeChannelUpdateEvent
import live.tsradio.master.files.Filesystem
import live.tsradio.master.events.Events
import live.tsradio.master.events.node.OnNodeStatusChangeEvent
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.FileInputStream
import java.lang.Exception
import java.net.SocketException

object SocketServer {
    private val logger: Logger = LoggerFactory.getLogger(SocketServer::class.java)
    var instance = SocketIOServer(Configuration())

    init {
        val config = Configuration()

        if(Filesystem.preferences.master.ssl) {
            config.keyStorePassword = Filesystem.preferences.master.keystorePass
            config.keyStore = FileInputStream(Filesystem.keystoreFile)
        }

        config.hostname = Filesystem.preferences.master.host
        config.port = Filesystem.preferences.master.port
        config.exceptionListener = ExceptionHandler()

        instance = SocketIOServer(config)

        instance.addConnectListener(OnClientConnectionEvent())
        instance.addDisconnectListener(OnClientDisconnectEvent())

        instance.addEventListener(Events.EVENT_NODE_CHANNEL_UPDATE, String::class.java, OnNodeChannelUpdateEvent())
        instance.addEventListener(Events.EVENT_NODE_CHANNEL_INFO_UPDATE, String::class.java, OnNodeChannelInfoUpdateEvent())
        instance.addEventListener(Events.EVENT_NODE_STATUS_CHANGE, String::class.java, OnNodeStatusChangeEvent())
    }

    fun start() {
        Thread(Runnable {
            logger.info("Starting socket server '${Filesystem.preferences.master.host}:${Filesystem.preferences.master.port}'")
            instance.start()
        },"socketio-server").start()
    }

    private class ExceptionHandler: ExceptionListener {
        override fun onConnectException(e: Exception?, client: SocketIOClient?) {
            logger.error("An error occured when building up a connection with client '${when(client != null) {
                true -> client.remoteAddress.toString()+"/"+client.sessionId.toString()
                else -> ""
            }}': "+when(e != null) {
                true -> e.message
                else -> ""
            })

            if(e != null) throw e
        }

        override fun onEventException(e: Exception?, args: MutableList<Any>?, client: SocketIOClient?) {
            logger.error("An error occured when firing an event on client '${when(client != null) {
                true -> client.remoteAddress.toString()+"/"+client.sessionId.toString()
                else -> ""
            }}': "+when(e != null) {
                true -> e.message
                else -> ""
            })

            if(e != null) throw e
        }

        override fun onDisconnectException(e: Exception?, client: SocketIOClient?) {
            logger.error("An error occured when disconnecting client '${when(client != null) {
                true -> client.remoteAddress.toString()+"/"+client.sessionId.toString()
                else -> ""
            }}': "+when(e != null) {
                true -> e.message
                else -> ""
            })
        }

        override fun exceptionCaught(ctx: ChannelHandlerContext?, e: Throwable?): Boolean {
            if(e != null) {
                if(e is SocketException) {
                    logger.warn("A Client lost connection: ${e.message}")
                    return true
                } else {
                    throw e
                }
            }
            return false
        }

    }
}
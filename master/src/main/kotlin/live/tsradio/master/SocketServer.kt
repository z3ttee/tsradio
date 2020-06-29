package live.tsradio.master

import com.corundumstudio.socketio.Configuration
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.SocketIOServer
import com.corundumstudio.socketio.listener.ExceptionListener
import io.netty.channel.ChannelHandlerContext
import live.tsradio.master.events.OnClientConnectionEvent
import live.tsradio.master.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.FileInputStream
import java.lang.Exception

object SocketServer {
    private val logger: Logger = LoggerFactory.getLogger(SocketServer::class.java)
    var instance = SocketIOServer(Configuration())

    init {
        val config = Configuration()

        if(Filesystem.preferences.master.ssl) {
            config.keyStorePassword = Filesystem.preferences.master.privateKeyPassword
            config.keyStore = FileInputStream(Filesystem.keystoreFile)
        }

        config.hostname = Filesystem.preferences.master.host
        config.port = Filesystem.preferences.master.port
        config.exceptionListener = ExceptionHandler()

        instance = SocketIOServer(config)
        instance.addConnectListener(OnClientConnectionEvent())
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
            if(e != null) throw e
            return true
        }

    }
}
package live.tsradio.nodeserver.events.client

import io.socket.emitter.Emitter
import live.tsradio.nodeserver.SocketClient
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientDisconnectEvent: Emitter.Listener {
    private val logger: Logger = LoggerFactory.getLogger(SocketClient::class.java)

    override fun call(vararg args: Any?) {
        logger.info("Client lost connection to master")
    }
}
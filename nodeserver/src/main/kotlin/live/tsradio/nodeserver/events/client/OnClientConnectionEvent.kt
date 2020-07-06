package live.tsradio.nodeserver.events.client

import io.socket.emitter.Emitter
import live.tsradio.nodeserver.SocketClient
import live.tsradio.nodeserver.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientConnectionEvent: Emitter.Listener {
    private val logger: Logger = LoggerFactory.getLogger(SocketClient::class.java)

    override fun call(vararg args: Any?) {
        logger.info("Client connected to master '${Filesystem.preferences.master.host}:${Filesystem.preferences.master.port}' successfully")
    }
}
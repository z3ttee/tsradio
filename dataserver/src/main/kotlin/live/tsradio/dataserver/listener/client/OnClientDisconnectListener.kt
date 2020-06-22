package live.tsradio.dataserver.listener.client

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DisconnectListener
import live.tsradio.dataserver.handler.ClientConnectionHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientDisconnectListener: DisconnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnClientDisconnectListener::class.java)

    override fun onDisconnect(client: SocketIOClient?) {
        if(client != null) {
            ClientConnectionHandler.remove(client)
            logger.info("Client '${client.remoteAddress}/${client.sessionId}' disconnected.")
        }
    }

}
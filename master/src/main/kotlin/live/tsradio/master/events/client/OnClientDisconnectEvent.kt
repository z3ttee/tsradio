package live.tsradio.master.events.client

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DisconnectListener
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.NodeHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientDisconnectEvent: DisconnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnClientDisconnectEvent::class.java)

    override fun onDisconnect(client: SocketIOClient?) {
        if(client != null) {
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData is NodeClient) {
                NodeHandler.unloadNode(clientData.id)
            }

            logger.info("Client '${client.remoteAddress}/${client.sessionId}' disconnected.")
            ClientHandler.remove(client.sessionId)
        }
    }

}
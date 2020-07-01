package live.tsradio.master.events.client

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.ConnectListener
import com.google.gson.GsonBuilder
import com.google.gson.JsonParser
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.NodeHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientConnectionEvent: ConnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnClientConnectionEvent::class.java)

    override fun onConnect(client: SocketIOClient?) {
        if(client != null) {
            val authData = client.handshakeData.getSingleUrlParam("authenticate")

            if(authData != null) {
                val data = JsonParser().parse(authData).asJsonObject
                ClientHandler.authenticate(client, data)
            } else {
                ClientHandler.authenticate(client, null)
            }

            val clientData = ClientHandler.getClient(client.sessionId)!!
            if(clientData is NodeClient) {
                NodeHandler.loadNode(clientData.nodeID)
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Authenticated as daemon node")
            } else {
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Authenticated as listener. Sending initial data...")
                client.sendEvent("onInitialTransport", GsonBuilder().create().toJson(NodeHandler.getListedChannels()))
            }
        }
    }
}
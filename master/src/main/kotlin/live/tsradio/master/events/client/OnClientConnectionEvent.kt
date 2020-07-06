package live.tsradio.master.events.client

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.ConnectListener
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import live.tsradio.master.api.auth.AuthPacket
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.events.Events
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.NodeHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientConnectionEvent: ConnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnClientConnectionEvent::class.java)

    override fun onConnect(client: SocketIOClient?) {
        if(client != null) {
            val authData = client.handshakeData.getSingleUrlParam("authenticate")

            if(authData == null) {
                ClientHandler.authenticate(client, null)
            } else {
                ClientHandler.authenticate(client, Gson().fromJson(authData, AuthPacket::class.java))
            }

            val clientData = ClientHandler.getClient(client.sessionId)!!
            if(clientData is NodeClient) {
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Authenticated as daemon node")
            } else {
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Authenticated as listener. Sending initial data...")
                for(channel in NodeHandler.getListedChannels()) {
                    client.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, channel.toListenerSafeJSON())
                }
                //client.sendEvent("onInitialTransport", GsonBuilder().create().toJson(NodeHandler.getListedChannels()))
            }
        }
    }
}
package live.tsradio.master.events

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.ConnectListener
import com.google.gson.GsonBuilder
import com.google.gson.JsonParser
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.RadioHandler
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

            if(ClientHandler.getClient(client.sessionId)!!.isNode) {
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Authenticated as daemon node")
            } else {
                client.sendEvent("onInitialTransport", GsonBuilder().create().toJson(RadioHandler.channels.values.filter { it.listed }))
            }
        }
    }
}
package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.ConnectListener
import com.google.gson.JsonParser
import live.tsradio.dataserver.api.InitialDataTransport
import live.tsradio.dataserver.handler.AuthHandler
import live.tsradio.dataserver.handler.ClientConnectionHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnConnectListener: ConnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnConnectListener::class.java)

    override fun onConnect(client: SocketIOClient?) {
        if(client != null) {
            val parser = JsonParser()

            if(client.handshakeData.getSingleUrlParam("authenticate") != null) {
                logger.info("Found authentication data on connect. Authenticating client...")
                val data = parser.parse(client.handshakeData.getSingleUrlParam("authenticate"))
                AuthHandler.authenticate(client, data.asJsonObject)
            } else {
                AuthHandler.authenticate(client, null)
            }

            if(AuthHandler.get(client.sessionId)!!.accountType == AuthHandler.AccountType.LISTENER) {
                ClientConnectionHandler.add(client)
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Sending initial data...")
                client.sendEvent("onInitialDataTransport", InitialDataTransport())
            } else {
                logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected. Authenticated as daemon node")
            }
        }
    }

}
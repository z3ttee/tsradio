package live.tsradio.dataserver.listener.channel

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.GsonBuilder
import com.google.gson.JsonParser
import live.tsradio.dataserver.Server
import live.tsradio.dataserver.handler.AuthHandler
import live.tsradio.dataserver.handler.ClientConnectionHandler
import live.tsradio.dataserver.handler.RadioHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnChannelInfoListener: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnChannelInfoListener::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {

            // Unauthenticated clients or non-node-clients aren't allowed to send data
            if(!AuthHandler.isAuthenticated(client.sessionId) || !AuthHandler.isNode(client.sessionId)) {
                return
            }

            val json = JsonParser().parse(data).asJsonObject
            val channel = RadioHandler.getChannel(json["id"].asString)

            if(channel != null) {
                logger.info("Received info update for channel '${channel.name}' from node '${channel.nodeID}'. Distributing to listeners...")
                Server.server.broadcastOperations.sendEvent("onChannelInfoUpdate", client, data)
            }
        }
    }
}
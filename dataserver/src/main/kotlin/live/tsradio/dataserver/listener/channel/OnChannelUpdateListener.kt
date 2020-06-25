package live.tsradio.dataserver.listener.channel

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import live.tsradio.dataserver.Server
import live.tsradio.dataserver.handler.AuthHandler
import live.tsradio.dataserver.handler.RadioHandler
import live.tsradio.dataserver.packets.channel.ChannelDataPacket
import live.tsradio.dataserver.packets.channel.ChannelRemovedPacket
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnChannelUpdateListener: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnChannelUpdateListener::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {

            // Unauthenticated clients or non-node-clients aren't allowed to send data
            if(!AuthHandler.isAuthenticated(client.sessionId) || !AuthHandler.isNode(client.sessionId)) {
                return
            }

            val dataPacket = GsonBuilder().create().fromJson(data, ChannelDataPacket::class.java)

            logger.info("Received update for channel '${dataPacket.name}' from node '${dataPacket.nodeID}'. Distributing to listeners...")

            val oldData = RadioHandler.getChannel(dataPacket.id!!)
            RadioHandler.setChannelData(dataPacket.id!!, dataPacket)

            if(oldData != null && oldData.listed!! && !dataPacket.listed!!) {
                // Channel not listed anymore -> Trigger Unlisted event -> Send to clients
                val removedPacket = ChannelRemovedPacket(dataPacket.id!!)
                Server.server.broadcastOperations.sendEvent(removedPacket.eventName, removedPacket.toClientSafeJson())
                return
            }

            if(dataPacket.listed!!) {
                val d = dataPacket.toClientSafeJson()
                logger.info(d)
                Server.server.broadcastOperations.sendEvent(dataPacket.eventName, dataPacket.toClientSafeJson())
            }
        }
    }
}
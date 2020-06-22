package live.tsradio.dataserver.listener.channel

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.GsonBuilder
import com.google.gson.JsonParser
import live.tsradio.dataserver.Server
import live.tsradio.dataserver.handler.AuthHandler
import live.tsradio.dataserver.handler.RadioHandler
import live.tsradio.dataserver.packets.channel.ChannelDataPacket
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

            val json = JsonParser().parse(data).asJsonObject
            logger.info("Received update for channel '${json["name"].asString}' from node '${json["nodeID"].asString}'. Distributing to listeners...")

            val oldData = RadioHandler.getChannel(json["id"].asString)
            if(oldData != null && oldData.listed && !json["listed"].asBoolean) {
                // Channel not listed anymore -> Trigger Unlisted event -> Send to clients
                Server.server.broadcastOperations.sendEvent("onChannelUnlisted", "{\"id\": \"${json["id"].asString}\"}")
            }

            val dataPacket: ChannelDataPacket = GsonBuilder().create().fromJson(json, ChannelDataPacket::class.java)
            logger.info("$dataPacket")

            val clientSafeData = json
            //clientSafeData.remove("")

            Server.server.broadcastOperations.sendEvent("", GsonBuilder().create().toJson(clientSafeData))
            RadioHandler.setChannelData(json["id"].asString, GsonBuilder().create().fromJson(json, ChannelDataPacket::class.java))
            //logger.info("Received channel update for channel ${data.id}")

            /*val oldData = RadioHandler.getChannel(UUID.fromString(data.id))
            RadioHandler.setChannelData(UUID.fromString(data.id), data)

            // Check if old data was listed but now isnt -> Send removal data to clients
            if(oldData != null && oldData.listed && !data.listed) {
                RadioHandler.getListeners().forEach {
                    Server.server.broadcastOperations.sendEvent("onChannelRemoved", data.id)
                }
                return
            }

            if(data.listed) {
                for(listener in RadioHandler.getListeners()) {
                    val channelDataUpdate = data.toChannelDataUpdate()

                    // Remove history if not subscribed
                    if(!RadioHandler.clientHasSubscribed(listener, RadioDataTypes.CHANNEL_HISTORY)) {
                        channelDataUpdate.info.history = HashMap()
                    }

                    Server.server.getClient(listener).sendEvent("onChannelDataUpdate", data)
                }
            }*/
        }
    }
}
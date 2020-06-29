package live.tsradio.master.events.node

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.corundumstudio.socketio.listener.DisconnectListener
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import live.tsradio.master.SocketServer
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.RadioHandler
import live.tsradio.master.packets.NodeChannelDataPacket
import live.tsradio.master.utils.Events
import live.tsradio.master.utils.Permissions
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnNodeChannelUpdateEvent: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnNodeChannelUpdateEvent::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            logger.info("Channel update")
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData != null) {
                if (clientData.isNode) {
                    // Modify received packet (remove unnecessary data)
                    val dataPacket = Gson().fromJson(data, NodeChannelDataPacket::class.java)
                    val oldData = RadioHandler.channels[dataPacket.channel.id]

                    if(oldData!!.listed && !dataPacket.channel.listed) {
                        // Not listed anymore -> Send removed event to clients
                        ClientHandler.clients.values.filter { !it.isNode }.forEach {
                            it.client.sendEvent(Events.EVENT_NODE_CHANNEL_REMOVED, "{\"id\": \"${dataPacket.channel.id}\"}")
                        }
                        return
                    }

                    val clientSafe = dataPacket.toListenerSafeJSON()
                    ClientHandler.clients.values.filter { !it.isNode }.forEach {
                        it.client.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, clientSafe)
                    }

                    RadioHandler.channels[dataPacket.channel.id] = dataPacket.channel
                } else if(clientData.hasPermission(Permissions.PERMISSION_POST_CHANNEL_UPDATE)) {
                    // Check if client has permission to post channel updates
                    // If true -> Send update to matching node server

                    val dataPacket = Gson().fromJson(data, NodeChannelDataPacket::class.java)
                    ClientHandler.getNodeForChannel(dataPacket.channel)?.client?.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, dataPacket.toJSON())
                    RadioHandler.channels[dataPacket.channel.id] = dataPacket.channel
                }
            }
        }
    }

}
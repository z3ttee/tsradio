package live.tsradio.master.events.node

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.Gson
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.api.node.channel.NodeChannel
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.NodeHandler
import live.tsradio.master.events.Events
import live.tsradio.master.utils.Permissions
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnNodeChannelUpdateEvent: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnNodeChannelUpdateEvent::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData != null) {
                if (clientData is NodeClient) {
                    logger.info("received channel update")

                    // Modify received packet (remove unnecessary data)
                    val dataPacket = Gson().fromJson(data, NodeChannel::class.java)
                    val oldData = NodeHandler.channels[dataPacket.id]

                    if(oldData != null && oldData.listed && !dataPacket.listed) {
                        // Not listed anymore -> Send removed event to clients
                        NodeHandler.channels[dataPacket.id] = dataPacket
                        ClientHandler.clients.values.filter { it !is NodeClient }.forEach {
                            it.client.sendEvent(Events.EVENT_NODE_CHANNEL_REMOVED, "{\"id\": \"${dataPacket.id}\"}")
                        }
                        return
                    }

                    logger.info(dataPacket.toString())

                    val clientSafe = dataPacket.toListenerSafeJSON()
                    ClientHandler.clients.values.filter { it !is NodeClient }.forEach {
                        it.client.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, clientSafe)
                    }

                    NodeHandler.channels[dataPacket.id] = dataPacket
                } else if(clientData.hasPermission(Permissions.PERMISSION_POST_CHANNEL_UPDATE)) {
                    // Check if client has permission to post channel updates
                    // If true -> Send update to matching node server

                    val dataPacket = Gson().fromJson(data, NodeChannel::class.java)
                    ClientHandler.getNodeForChannel(dataPacket)?.client?.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, dataPacket.toJSON())
                    NodeHandler.channels[dataPacket.id] = dataPacket
                }
            }
        }
    }

}
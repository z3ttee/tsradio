package live.tsradio.master.events.node

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.Gson
import com.google.gson.JsonParser
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.api.node.channel.NodeChannel
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.NodeHandler
import live.tsradio.master.events.Events
import live.tsradio.master.utils.Permissions
import java.util.*

class OnNodeChannelCreateEvent: DataListener<String> {

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData != null) {
                if(clientData.hasPermission(Permissions.PERMISSION_POST_CHANNEL_CREATION)) {
                    // Check if client has permission to post channel creation
                    // If true -> Load channel from mysql and send to matching node server

                    val dataPacket = JsonParser().parse(data).asJsonObject
                    val id = UUID.fromString(dataPacket["id"].asString)
                    val nodeChannel = NodeHandler.loadChannel(id)

                    if(nodeChannel != null) {

                    }

                    //ClientHandler.getNodeForChannel(dataPacket)?.client?.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, dataPacket.toJSON())
                    //NodeHandler.channels[dataPacket.id] = dataPacket
                }
            }
        }
    }

}
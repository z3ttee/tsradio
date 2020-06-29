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
import live.tsradio.master.packets.NodeChannelDataPacket
import live.tsradio.master.utils.Events
import live.tsradio.master.utils.Permissions

class OnNodeChannelUpdateEvent: DataListener<String> {

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData != null) {
                if (clientData.isNode) {
                    // Modify received packet (remove unnecessary data)
                    val dataPacket = Gson().fromJson(data, NodeChannelDataPacket::class.java).toListenerSafeJSON()

                    ClientHandler.clients.values.filter { !it.isNode }.forEach {
                        it.client.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, dataPacket)
                    }

                } else if(clientData.hasPermission(Permissions.PERMISSION_POST_CHANNEL_UPDATE)) {
                    // Check if client has permission to post channel updates
                    // If true -> Send update to matching node server

                    val dataPacket = Gson().fromJson(data, NodeChannelDataPacket::class.java)
                    ClientHandler.getNodeForChannel(dataPacket.channel)?.client?.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, dataPacket.toJSON())
                }
            }
        }
    }

}
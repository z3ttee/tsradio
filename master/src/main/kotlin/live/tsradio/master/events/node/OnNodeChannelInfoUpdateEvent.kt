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
import live.tsradio.master.packets.NodeChannelInfoDataPacket
import live.tsradio.master.utils.Events
import live.tsradio.master.utils.Permissions
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnNodeChannelInfoUpdateEvent: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnNodeChannelInfoUpdateEvent::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData != null && clientData.isNode) {
                // Check if client is nodeserver -> has permission to post channel info updates

                val dataPacket = Gson().fromJson(data, NodeChannelInfoDataPacket::class.java)
                val channel = RadioHandler.channels[dataPacket.channel.id]

                if(channel != null) {
                    channel.info = dataPacket.channel
                    RadioHandler.channels[channel.id] = channel

                    // Send update to clients
                    ClientHandler.clients.values.filter { !it.isNode }.forEach {
                        it.client.sendEvent(Events.EVENT_NODE_CHANNEL_INFO_UPDATE, dataPacket.toListenerSafeJSON())
                    }
                }
            }
        }
    }

}
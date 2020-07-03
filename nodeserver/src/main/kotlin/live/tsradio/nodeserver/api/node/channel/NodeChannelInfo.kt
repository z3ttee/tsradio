package live.tsradio.nodeserver.api.node.channel

import com.google.gson.annotations.Expose
import live.tsradio.nodeserver.SocketClient
import live.tsradio.nodeserver.events.Events
import live.tsradio.nodeserver.packets.Packet
import java.util.*
import kotlin.collections.HashMap

data class NodeChannelInfo(
        @Expose val id: UUID,
        @Expose var title: String,
        @Expose var artist: String,
        @Expose var history: HashMap<Long, HashMap<String, String>>
): Packet() {
    override fun toListenerSafeJSON(): String {
        TODO("Not yet implemented")
    }

    fun clear() {
        title = ""
        artist = ""
        history.clear()
    }

    fun sendUpdate() {
        SocketClient.socket?.emit(Events.EVENT_NODE_CHANNEL_INFO_UPDATE, this.toJSON())
    }
}
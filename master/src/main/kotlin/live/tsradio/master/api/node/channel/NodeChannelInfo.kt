package live.tsradio.master.api.node.channel

import com.google.gson.annotations.Expose
import live.tsradio.master.packets.Packet
import java.util.*
import kotlin.collections.HashMap

data class NodeChannelInfo(
        @Expose val id: UUID,
        @Expose val title: String,
        @Expose val artist: String,
        @Expose val history: HashMap<Long, HashMap<String, String>>
): Packet() {
    override fun toListenerSafeJSON(): String {
        return toJSON()
    }
}
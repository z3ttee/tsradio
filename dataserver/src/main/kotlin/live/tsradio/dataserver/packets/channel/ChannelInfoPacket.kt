package live.tsradio.dataserver.packets.channel

import com.google.gson.GsonBuilder
import com.google.gson.JsonElement
import live.tsradio.dataserver.packets.Packet
import kotlin.collections.HashMap

data class ChannelInfoPacket(
        var id: String,
        var title: String? = null,
        var artist: String? = null,
        var history: HashMap<Long, HashMap<String, String>> = HashMap()
): Packet("onChannelInfoUpdate") {
    override fun toClientSafeJson(): String {
        val json = GsonBuilder().create().toJsonTree(this).asJsonObject
        json.remove("eventName")
        return json.toString()
    }
}
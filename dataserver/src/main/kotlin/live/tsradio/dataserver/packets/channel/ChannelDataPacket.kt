package live.tsradio.dataserver.packets.channel

import com.google.gson.GsonBuilder
import com.google.gson.JsonElement
import live.tsradio.dataserver.packets.Packet
import org.slf4j.Logger
import org.slf4j.LoggerFactory

data class ChannelDataPacket(
        var id: String?,
        var nodeID: String?,
        var name: String?,
        var description: String?,
        var creatorID: String?,
        var mountpoint: String?,
        var playlistID: String?,
        var genres: ArrayList<String>?,
        var featured: Boolean?,
        var listed: Boolean?,
        var shuffled: Boolean?,
        var looped: Boolean?,
        var priority: Int?,
        var info: ChannelInfoPacket?
): Packet("onChannelUpdate") {

    override fun toClientSafeJson(): String {
        val json = GsonBuilder().create().toJsonTree(this).asJsonObject
        json.remove("nodeID")
        json.remove("playlistID")
        json.remove("shuffled")
        json.remove("listed")
        json.remove("looped")
        json.remove("eventName")
        return json.toString()
    }

}
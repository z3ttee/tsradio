package live.tsradio.master.packets

import com.google.gson.Gson
import live.tsradio.master.api.node.NodeChannel

class NodeChannelDataPacket(
    val channel: NodeChannel
): Packet() {
    override fun toListenerSafeJSON(): String {
        val jsonObject = Gson().toJsonTree(this).asJsonObject
        jsonObject.remove("nodeID")
        jsonObject.remove("playlistID")
        jsonObject.remove("shuffled")
        jsonObject.remove("looped")
        jsonObject.remove("listed")
        return jsonObject.toString()
    }

    override fun toJSON(): String {
        return Gson().toJson(this)
    }
}
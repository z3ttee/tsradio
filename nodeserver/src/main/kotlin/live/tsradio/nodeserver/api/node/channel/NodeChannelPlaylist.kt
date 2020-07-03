package live.tsradio.nodeserver.api.node.channel

import com.google.gson.Gson
import com.google.gson.annotations.Expose
import live.tsradio.nodeserver.packets.Packet
import java.util.*
import kotlin.collections.ArrayList

data class NodeChannelPlaylist(
        @Expose val id: UUID,
        @Expose val name: String,
        @Expose val creatorID: UUID,
        @Expose val genres: ArrayList<UUID>
): Packet() {
    override fun toListenerSafeJSON(): String {
        val jsonObject = Gson().toJsonTree(this).asJsonObject
        return jsonObject.toString()
    }
}
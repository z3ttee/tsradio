package live.tsradio.master.api.node.channel

import com.google.gson.Gson
import com.google.gson.annotations.Expose
import live.tsradio.master.packets.Packet
import java.util.*
import kotlin.collections.ArrayList

data class NodeChannel(
        @Expose val id: UUID,
        @Expose val name: String,
        @Expose val description: String,
        @Expose val nodeID: UUID,
        @Expose val creatorID: UUID,
        @Expose val mountpoint: String,
        @Expose val shuffled: Boolean,
        @Expose val looped: Boolean,
        @Expose val genres: ArrayList<UUID>,
        @Expose val featured: Boolean,
        @Expose val listed: Boolean,
        @Expose val priority: Int,
        @Expose var info: NodeChannelInfo?,
        @Expose var playlist: NodeChannelPlaylist?,
        var streamActive: Boolean
): Packet() {
    override fun toListenerSafeJSON(): String {
        val jsonObject = Gson().toJsonTree(this).asJsonObject
        jsonObject.remove("nodeID")
        jsonObject.remove("shuffled")
        jsonObject.remove("looped")
        jsonObject.remove("listed")
        jsonObject.remove("playlist")
        return jsonObject.toString()
    }
}
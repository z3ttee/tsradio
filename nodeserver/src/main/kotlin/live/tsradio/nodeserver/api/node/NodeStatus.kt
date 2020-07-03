package live.tsradio.nodeserver.api.node

import com.google.gson.Gson
import com.google.gson.annotations.Expose
import live.tsradio.nodeserver.packets.Packet
import java.util.*

data class NodeStatus(
    @Expose val id: UUID,
    @Expose val status: Int
): Packet() {
    override fun toListenerSafeJSON(): String {
        val jsonObject = Gson().toJsonTree(this).asJsonObject
        return jsonObject.toString()
    }

    companion object {
        const val NODE_STATUS_OFFLINE = 0
        const val NODE_STATUS_ONLINE = 1
        const val NODE_STATUS_STARTING = 2
    }
}
package live.tsradio.master.api.node

import java.util.*

data class NodeStatus(
        val id: UUID,
        val status: Int
) {
    companion object {
        const val NODE_STATUS_OFFLINE = 0
        const val NODE_STATUS_ONLINE = 1
        const val NODE_STATUS_STARTING = 2
    }
}
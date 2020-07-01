package live.tsradio.master.packets

import com.google.gson.annotations.Expose
import live.tsradio.master.api.node.NodeServer

class NodeDataPacket(
    @Expose val node: NodeServer
): Packet() {
    override fun toListenerSafeJSON(): String {
        TODO("Not yet implemented")
    }
}
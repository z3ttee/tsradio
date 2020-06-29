package live.tsradio.master.packets

import live.tsradio.master.api.node.NodeChannelInfo

class NodeChannelInfoDataPacket(
    val channel: NodeChannelInfo
): Packet() {
    override fun toListenerSafeJSON(): String {
        TODO("Not yet implemented")
    }

    override fun toJSON(): String {
        TODO("Not yet implemented")
    }
}
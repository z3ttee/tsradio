package live.tsradio.master.packets

import live.tsradio.master.api.NodeChannel

class ChannelDataPacket(
    val channel: NodeChannel
): Packet()
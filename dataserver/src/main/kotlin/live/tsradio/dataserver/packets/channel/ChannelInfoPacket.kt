package live.tsradio.dataserver.packets.channel

import live.tsradio.dataserver.packets.Packet
import kotlin.collections.HashMap

data class ChannelInfoPacket(
        var title: String? = null,
        var artist: String? = null,
        var history: HashMap<Long, HashMap<String, String>> = HashMap()
): Packet("onChannelInfoUpdate")
package live.tsradio.dataserver.packets.channel

import com.google.gson.GsonBuilder
import live.tsradio.dataserver.packets.Packet

class ChannelRemovedPacket(
        val id: String
): Packet("onChannelRemoved") {
    override fun toClientSafeJson(): String {
        return GsonBuilder().create().toJson(this)
    }
}
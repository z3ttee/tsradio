package live.tsradio.dataserver.packets

import com.google.gson.GsonBuilder
import live.tsradio.dataserver.packets.channel.ChannelDataPacket

class InitialTransportPacket(
        val channels: ArrayList<ChannelDataPacket> = ArrayList()
): Packet("onInitialTransport") {

    override fun toClientSafeJson(): Any {
        val list = ArrayList<Any>()

        channels.forEach {
            list.add(GsonBuilder().create().fromJson(it.toClientSafeJson(), Any::class.java))
        }

        return GsonBuilder().create().toJson(list)
    }

}
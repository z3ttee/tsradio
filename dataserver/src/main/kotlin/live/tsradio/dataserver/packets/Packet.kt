package live.tsradio.dataserver.packets

abstract class Packet(
        val eventName: String
) {
    abstract fun toClientSafeJson(): Any
}
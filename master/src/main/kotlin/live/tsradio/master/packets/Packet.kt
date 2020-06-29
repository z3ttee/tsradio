package live.tsradio.master.packets

abstract class Packet {

    abstract fun toListenerSafeJSON(): String
    abstract fun toJSON(): String

}
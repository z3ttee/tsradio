package live.tsradio.master.api.error

import live.tsradio.master.packets.Packet

data class ServerError(
        val status: Int,
        val message: String
): Packet() {
    override fun toListenerSafeJSON(): String {
        return "{}"
    }
}
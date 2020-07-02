package live.tsradio.master.api.auth

import live.tsradio.master.packets.Packet

data class AuthPacket(
    var accountType: AccountType,
    val hash: String,
    var granted: Boolean?
): Packet() {
    override fun toListenerSafeJSON(): String {
        // Not intended to be sent to listeners
        return "{}"
    }
}
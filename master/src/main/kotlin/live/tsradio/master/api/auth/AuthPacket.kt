package live.tsradio.master.api.auth

import live.tsradio.master.packets.Packet
import java.util.*

data class AuthPacket(
        val clientID: UUID,
        val clientKey: String,
        var accountType: AccountType,
        var granted: Boolean = false
): Packet() {
    override fun toListenerSafeJSON(): String {
        // Not intended to be sent to listeners
        return "{}"
    }
}
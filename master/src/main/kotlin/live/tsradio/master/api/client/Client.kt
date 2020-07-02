package live.tsradio.master.api.client

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.auth.AccountType
import live.tsradio.master.api.auth.AuthPacket
import java.util.*

abstract class Client(
        val id: UUID,
        val client: SocketIOClient,
        val authPacket: AuthPacket
) {

    // TODO: Build proper permission system
    fun hasPermission(permission: String): Boolean {
        return authPacket.accountType == AccountType.ACCOUNT_NODE && authPacket.granted
    }

}
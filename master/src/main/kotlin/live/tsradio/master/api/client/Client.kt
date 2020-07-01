package live.tsradio.master.api.client

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.auth.AccountType
import live.tsradio.master.api.auth.AuthData
import java.util.*

abstract class Client(
        val id: UUID,
        val client: SocketIOClient,
        private val authData: AuthData
) {
    val isNode = authData.accountType == AccountType.ACCOUNT_NODE

    // TODO: Build proper permission system
    fun hasPermission(permission: String): Boolean {
        return authData.accountType == AccountType.ACCOUNT_NODE && authData.granted
    }

}
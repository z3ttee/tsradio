package live.tsradio.master.api

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.auth.AccountType
import live.tsradio.master.api.auth.AuthData
import java.util.*

data class MasterClient(
    val id: UUID,
    val client: SocketIOClient,
    val authData: AuthData
) {
    val isNode = authData.accountType == AccountType.ACCOUNT_NODE

    // TODO: Build proper permission system
    fun hasPermission(permission: String): Boolean {
        return authData.accountType == AccountType.ACCOUNT_NODE && authData.granted
    }

}
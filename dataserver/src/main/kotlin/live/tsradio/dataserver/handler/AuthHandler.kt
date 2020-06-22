package live.tsradio.dataserver.handler

import com.corundumstudio.socketio.SocketIOClient
import com.google.gson.JsonObject
import live.tsradio.dataserver.database.MySQL
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.collections.HashMap

object AuthHandler {
    private val logger: Logger = LoggerFactory.getLogger(AuthHandler::class.java)

    private val authenticatedConnections: HashMap<UUID, AuthClient> = HashMap()

    fun authenticate(client: SocketIOClient, data: JsonObject?){
        val authClient = AuthClient(client)

        if(data == null) {
            this.authenticatedConnections[client.sessionId] = authClient
            return
        }

        authClient.authenticated = MySQL.exists(MySQL.tableSessions, "id = '${data["id"].asString}' AND sessionHash = '${data["key"].asString}'")

        if(MySQL.exists(MySQL.tableNodes, "id = '${data["id"].asString}'")){
            authClient.accountType = AccountType.NODE
        }

        this.authenticatedConnections[client.sessionId] = authClient
        client.sendEvent("onAuthenticated", "{\"status\": 200, \"accepted\": ${authClient.authenticated}}")
    }

    fun isAuthenticated(session: UUID): Boolean {
        return if(this.authenticatedConnections.containsKey(session)) {
            return this.get(session)!!.authenticated
        } else {
            false
        }
    }

    fun isNode(session: UUID): Boolean {
        return this.isAuthenticated(session) && this.get(session)!!.accountType == AccountType.NODE
    }

    fun get(session: UUID): AuthClient? {
        return this.authenticatedConnections.getOrDefault(session, null)
    }

    data class AuthClient(
            val socketClient: SocketIOClient,
            var authenticated: Boolean = false,
            var accountType: AccountType = AccountType.LISTENER
    )

    enum class AccountType(private val id: Int) {
        NODE(0),
        LISTENER(1)
    }
}
package live.tsradio.master.handler

import com.corundumstudio.socketio.SocketIOClient
import com.google.gson.JsonObject
import live.tsradio.master.api.MasterClient
import live.tsradio.master.api.auth.AccountType
import live.tsradio.master.api.auth.AuthData
import live.tsradio.master.api.node.NodeChannel
import live.tsradio.master.database.MySQL
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

object ClientHandler {
    val clients = HashMap<UUID, MasterClient>()

    fun authenticate(client: SocketIOClient, data: JsonObject?) {

        if(data == null) {
            this.clients[client.sessionId] = MasterClient(client.sessionId, client, AuthData(AccountType.ACCOUNT_LISTENER, "", false))
            return
        }

        val authData = AuthData(AccountType.ACCOUNT_LISTENER, data["key"].asString, false)
        if(MySQL.exists(MySQL.tableSessions, "id = '${data["id"].asString}' AND sessionHash = '${data["key"].asString}'")) {
            authData.granted = true

            // TODO: Send refresh event (prompt user with login)
            val expiration = MySQL.get(MySQL.tableSessions, "id = '${data["id"].asString}'", ArrayList(listOf("expirationDate")))
            if(expiration != null && expiration.next()) {

                if(expiration.getLong("expirationDate") != -1L || expiration.getLong("expirationDate") <= System.currentTimeMillis()) {
                    // Session expired
                    authData.granted = false
                }

                if(MySQL.exists(MySQL.tableNodes, "id = '${data["id"].asString}'")) {
                    // Register client as node
                    authData.accountType = AccountType.ACCOUNT_NODE
                }
            }
        }

        this.clients[client.sessionId] = MasterClient(client.sessionId, client, authData)
    }

    fun remove(uuid: UUID) {
        clients.remove(uuid)
    }

    fun getNodeForChannel(channel: NodeChannel): MasterClient? {
        return this.clients.values.toCollection(ArrayList()).filter { it.id == channel.id }[0]
    }

    fun getClient(uuid: UUID): MasterClient? {
        return this.clients.getOrDefault(uuid, null)
    }
}
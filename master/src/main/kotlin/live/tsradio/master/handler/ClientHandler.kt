package live.tsradio.master.handler

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.client.Client
import live.tsradio.master.api.auth.AccountType
import live.tsradio.master.api.auth.AuthPacket
import live.tsradio.master.api.client.ListenerClient
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.api.error.ServerError
import live.tsradio.master.api.node.channel.NodeChannel
import live.tsradio.master.events.Events
import live.tsradio.master.utils.MySQL
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

object ClientHandler {
    private val logger: Logger = LoggerFactory.getLogger(ClientHandler::class.java)
    val clients = HashMap<UUID, Client>()

    fun authenticate(client: SocketIOClient, authData: AuthPacket?) {
        if(authData == null) {
            this.clients[client.sessionId] = ListenerClient(client.sessionId, client, AuthPacket(client.sessionId, "", AccountType.ACCOUNT_LISTENER, true))
            return
        }

        authData.granted = false

        // Authenticate as node
        if(authData.accountType == AccountType.ACCOUNT_NODE) {
            // Check if clientID exists as node account
            if(MySQL.exists(MySQL.tableNodes, "id = '${authData.clientID}'") && MySQL.exists(MySQL.tableSessions, "id = '${authData.clientID}' AND sessionHash = '${authData.clientKey}'")) {
                val result = MySQL.get(MySQL.tableSessions, "id = '${authData.clientID}'", ArrayList(listOf("expirationDate")))
                if(result != null && result.next()) {
                    val expiry = result.getLong("expirationDate")
                    if(expiry != -1L || expiry <= System.currentTimeMillis()) {
                        authData.granted = true
                        this.clients[client.sessionId] = NodeClient(client.sessionId, client, authData)
                        client.sendEvent(Events.EVENT_CLIENT_AUTHENTICATED, authData.toJSON())
                        return
                    }
                }
            }

            // Send error event and disconnect client
            client.sendEvent(Events.EVENT_SERVER_ERROR, ServerError(200, "Can't authenticate client as node with given credentials.").toJSON())
            client.disconnect()
            return
        }

        // Else login as normal radio listener client
        authData.granted = true
        authData.accountType = AccountType.ACCOUNT_LISTENER
        client.sendEvent(Events.EVENT_CLIENT_AUTHENTICATED, authData.toJSON())
        this.clients[client.sessionId] = ListenerClient(client.sessionId, client, authData)
    }

    fun remove(uuid: UUID) {
        clients.remove(uuid)
    }

    fun getNodeForChannel(channel: NodeChannel): Client? {
        return this.clients.values.toCollection(ArrayList()).filter { it.id == channel.id }[0]
    }

    fun getClient(uuid: UUID): Client? {
        return this.clients.getOrDefault(uuid, null)
    }
}
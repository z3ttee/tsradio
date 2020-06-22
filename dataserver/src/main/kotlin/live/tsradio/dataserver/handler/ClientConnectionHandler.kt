package live.tsradio.dataserver.handler

import com.corundumstudio.socketio.SocketIOClient
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

object ClientConnectionHandler {

    private val connectedClients = HashMap<UUID, SocketIOClient>()

    fun add(client: SocketIOClient){
        this.connectedClients[client.sessionId] = client
    }
    fun get(uuid: UUID): SocketIOClient? {
        return if(has(uuid)) {
            this.connectedClients[uuid]
        } else {
            null
        }
    }
    fun getAll(): HashMap<UUID, SocketIOClient> {
        return this.connectedClients
    }
    fun remove(client: SocketIOClient) {
        this.remove(client.sessionId)
        RadioHandler.remove(client.sessionId)
    }
    fun remove(uuid: UUID) {
        if(has(uuid)) this.connectedClients.remove(uuid)
    }
    fun has(uuid: UUID): Boolean {
        return this.connectedClients.containsKey(uuid)
    }

    fun getConnectedNodes(): ArrayList<SocketIOClient> {
        return this.connectedClients.values.filter { AuthHandler.isNode(it.sessionId) }.toCollection(ArrayList())
    }
}
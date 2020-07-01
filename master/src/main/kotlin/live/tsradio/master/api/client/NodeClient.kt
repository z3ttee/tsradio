package live.tsradio.master.api.client

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.auth.AuthData
import java.util.*

class NodeClient(
        id: UUID,
        client: SocketIOClient,
        authData: AuthData,
        val nodeID: UUID
): Client(id, client, authData) {

}
package live.tsradio.master.api.client

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.auth.AuthData
import java.util.*

class ListenerClient(
        id: UUID,
        client: SocketIOClient,
        authData: AuthData
): Client(id, client, authData)
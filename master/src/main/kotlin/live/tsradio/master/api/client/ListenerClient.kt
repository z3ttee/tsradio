package live.tsradio.master.api.client

import com.corundumstudio.socketio.SocketIOClient
import live.tsradio.master.api.auth.AuthPacket
import java.util.*

class ListenerClient(
        id: UUID,
        client: SocketIOClient,
        authPacket: AuthPacket
): Client(id, client, authPacket)
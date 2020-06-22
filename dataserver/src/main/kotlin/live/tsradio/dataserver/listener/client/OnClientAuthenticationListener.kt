package live.tsradio.dataserver.listener.client

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import live.tsradio.dataserver.api.AuthData

class OnClientAuthenticationListener: DataListener<AuthData> {
    override fun onData(client: SocketIOClient?, data: AuthData?, ackSender: AckRequest?) {

    }
}
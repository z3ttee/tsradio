package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import live.tsradio.dataserver.api.MovingClient
import live.tsradio.dataserver.handler.RadioHandler

class OnMoveChannelListener: DataListener<MovingClient> {
    override fun onData(client: SocketIOClient?, data: MovingClient?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            RadioHandler.move(client.sessionId, data.from, data.to)
        }
    }
}
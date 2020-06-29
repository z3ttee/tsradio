package live.tsradio.master.events

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DisconnectListener
import live.tsradio.master.handler.ClientHandler

class OnClientDisconnectEvent: DisconnectListener {

    override fun onDisconnect(client: SocketIOClient?) {
        if(client != null) ClientHandler.remove(client.sessionId)
    }

}
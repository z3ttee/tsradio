package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.ConnectListener
import com.corundumstudio.socketio.listener.DisconnectListener
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnDisconnectListener: DisconnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnDisconnectListener::class.java)

    override fun onDisconnect(client: SocketIOClient?) {
        if(client != null) {
            logger.info("Client '${client.remoteAddress}/${client.sessionId}' disconnected.")
        }
    }

}
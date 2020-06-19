package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.ConnectListener
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnConnectListener: ConnectListener {
    private val logger: Logger = LoggerFactory.getLogger(OnConnectListener::class.java)

    override fun onConnect(client: SocketIOClient?) {
        if(client != null) {
            logger.info("Client '${client.remoteAddress}/${client.sessionId}' connected.")
        }
    }

}
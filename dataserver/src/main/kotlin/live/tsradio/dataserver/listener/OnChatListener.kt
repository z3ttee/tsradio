package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import live.tsradio.dataserver.ChatObject
import live.tsradio.dataserver.Server
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnChatListener: DataListener<ChatObject> {
    private val logger: Logger = LoggerFactory.getLogger(OnChatListener::class.java)

    override fun onData(client: SocketIOClient?, data: ChatObject?, ackSender: AckRequest?) {
        logger.info(client.toString() + data)
        Server.server.broadcastOperations.sendEvent("chatevent", data)
    }

}
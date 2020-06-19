package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnChannelDataListener: DataListener<ByteArray> {
    private val logger: Logger = LoggerFactory.getLogger(OnChannelDataListener::class.java)

    override fun onData(client: SocketIOClient?, data: ByteArray?, ackSender: AckRequest?) {
        logger.info(data.toString())
    }
}
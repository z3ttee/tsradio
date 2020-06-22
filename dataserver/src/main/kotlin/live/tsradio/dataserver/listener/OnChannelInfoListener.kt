package live.tsradio.dataserver.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.JsonParser
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnChannelInfoListener: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnChannelInfoListener::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            val json = JsonParser().parse(data)

            logger.info(data)
            //logger.info("Received channel update for channel ${data.id}")

            /*val oldData = RadioHandler.getChannel(UUID.fromString(data.id))
            RadioHandler.setChannelData(UUID.fromString(data.id), data)

            // Check if old data was listed but now isnt -> Send removal data to clients
            if(oldData != null && oldData.listed && !data.listed) {
                RadioHandler.getListeners().forEach {
                    Server.server.broadcastOperations.sendEvent("onChannelRemoved", data.id)
                }
                return
            }

            if(data.listed) {
                for(listener in RadioHandler.getListeners()) {
                    val channelDataUpdate = data.toChannelDataUpdate()

                    // Remove history if not subscribed
                    if(!RadioHandler.clientHasSubscribed(listener, RadioDataTypes.CHANNEL_HISTORY)) {
                        channelDataUpdate.info.history = HashMap()
                    }

                    Server.server.getClient(listener).sendEvent("onChannelDataUpdate", data)
                }
            }*/
        }
    }
}
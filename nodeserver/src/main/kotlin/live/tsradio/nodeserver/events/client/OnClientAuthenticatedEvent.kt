package live.tsradio.nodeserver.events.client

import com.google.gson.Gson
import io.socket.emitter.Emitter
import live.tsradio.nodeserver.Core
import live.tsradio.nodeserver.SocketClient
import live.tsradio.nodeserver.api.auth.AuthPacket
import live.tsradio.nodeserver.events.Events
import live.tsradio.nodeserver.handler.ChannelHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnClientAuthenticatedEvent: Emitter.Listener {
    private val logger: Logger = LoggerFactory.getLogger(SocketClient::class.java)

    override fun call(vararg args: Any?) {
        val packet = Gson().fromJson(Gson().toJsonTree(args).asJsonArray[0].asString, AuthPacket::class.java)
        Core.authData = packet

        for(channel in ChannelHandler.getRunningChannels()) {
            logger.info("sending "+channel.data.name)
            logger.info("${channel.data.info}")
            if(channel.data.info != null) {
                SocketClient.socket?.emit(Events.EVENT_NODE_CHANNEL_UPDATE, channel.data.toJSON())
            }
        }

        if(!Core.authData.granted) {
            logger.error("Authorized access to master not granted.")
        }
    }
}
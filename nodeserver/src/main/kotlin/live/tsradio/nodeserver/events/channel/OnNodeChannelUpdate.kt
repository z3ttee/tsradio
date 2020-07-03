package live.tsradio.nodeserver.events.channel

import com.google.gson.Gson
import io.socket.emitter.Emitter
import live.tsradio.nodeserver.api.node.channel.NodeChannel
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnNodeChannelUpdate: Emitter.Listener {
    private val logger: Logger = LoggerFactory.getLogger(OnNodeChannelUpdate::class.java)

    override fun call(vararg args: Any?) {
        val packet = Gson().fromJson(Gson().toJsonTree(args).asJsonArray[0].asString, NodeChannel::class.java)

        logger.info("Got data for channel ${packet.name}")
    }
}
package live.tsradio.nodeserver.events.server

import com.google.gson.Gson
import io.socket.emitter.Emitter
import live.tsradio.nodeserver.api.error.ServerError
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnServerErrorEvent: Emitter.Listener {
    private val logger: Logger = LoggerFactory.getLogger(OnServerErrorEvent::class.java)

    override fun call(vararg args: Any?) {
        val packet = Gson().fromJson(Gson().toJsonTree(args).asJsonArray[0].asString, ServerError::class.java)

        when(packet.errorCode) {
            ServerError.ERROR_WRONG_AUTH_CREDENTIALS -> {
                logger.error("Error occured on authentication: ${packet.message}")
            }
        }
    }
}
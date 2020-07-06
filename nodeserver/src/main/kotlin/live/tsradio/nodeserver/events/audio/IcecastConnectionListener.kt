package live.tsradio.nodeserver.events.audio

import org.slf4j.Logger
import org.slf4j.LoggerFactory

object IcecastConnectionListener {
    private val logger: Logger = LoggerFactory.getLogger(IcecastConnectionListener::class.java)

    fun onConnectionEstablished(){
        logger.info("Connected to icecast")
    }
    fun onConnectionError(exception: Exception){

    }
    fun onConnectionLost(){

    }

}
package live.tsradio.dataserver.exception

import live.tsradio.dataserver.Server
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class ExceptionHandler(private val exception: Throwable) {
    private val logger: Logger = LoggerFactory.getLogger(Server::class.java)

    fun handle(){
        exception.printStackTrace()
    }

}
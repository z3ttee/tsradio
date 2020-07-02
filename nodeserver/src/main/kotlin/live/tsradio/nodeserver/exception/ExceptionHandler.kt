package live.tsradio.nodeserver.exception

import com.mysql.cj.jdbc.exceptions.CommunicationsException
import live.tsradio.nodeserver.Core
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class ExceptionHandler(private val exception: Throwable) {
    private val logger: Logger = LoggerFactory.getLogger(Core::class.java)

    fun handle(){
        if (exception is MissingFileException || exception is CannotLoadConfigException) {
            logger.error("An error occured: ${exception.message}")
            return
        }
        if(exception is CommunicationsException) {
            logger.error("A mysql error occured: ${exception.message}")
            return
        }

        exception.printStackTrace()
    }

}
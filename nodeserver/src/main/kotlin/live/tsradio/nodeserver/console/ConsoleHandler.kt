package live.tsradio.nodeserver.console

import org.slf4j.Logger
import org.slf4j.LoggerFactory

class ConsoleHandler: Thread("console-input") {
    private val logger: Logger = LoggerFactory.getLogger(ConsoleHandler::class.java)

    override fun run() {
        try {
            while(true) {
                val input = readLine()?: return
                CommandHandler.handle(input)
            }
        } catch (ignored: Exception){
            logger.warn("An exception occured in console handler. That means, command input through a console may not be available.")
        }
    }
}
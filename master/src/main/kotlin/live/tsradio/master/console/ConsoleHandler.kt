package live.tsradio.master.console

import org.slf4j.Logger
import org.slf4j.LoggerFactory

class ConsoleHandler: Thread("console-input") {
    private val logger: Logger = LoggerFactory.getLogger(ConsoleHandler::class.java)

    override fun run() {
        while(true) {
            val input = readLine()
            if(input != null) CommandHandler.handle(input)
            else sleep(10*1000)
        }
    }
}
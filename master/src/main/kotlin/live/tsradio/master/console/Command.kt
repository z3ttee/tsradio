package live.tsradio.master.console

import org.slf4j.Logger
import org.slf4j.LoggerFactory

abstract class Command(val name: String, val usage: String, val description: String) {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    abstract fun execute(name: String, args: ArrayList<String>)

    fun sendUsage(){
        logger.warn("Did you mean: '$name $usage' ?")
    }
    fun sendText(text: String){
        logger.info(text)
    }
}
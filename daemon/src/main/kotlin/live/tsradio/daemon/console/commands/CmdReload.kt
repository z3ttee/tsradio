package live.tsradio.daemon.console.commands

import live.tsradio.daemon.console.Command
import live.tsradio.daemon.console.CommandHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class CmdReload: Command("", "", "") {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    override fun execute(name: String, args: ArrayList<String>) {
        // TODO: Change to restart whole daemon

        logger.info("Config reloaded.")
    }
}
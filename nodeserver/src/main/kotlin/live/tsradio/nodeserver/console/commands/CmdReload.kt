package live.tsradio.nodeserver.console.commands

import live.tsradio.nodeserver.console.Command
import live.tsradio.nodeserver.console.CommandHandler
import live.tsradio.nodeserver.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class CmdReload: Command("reload", "", "Reload config") {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    override fun execute(name: String, args: ArrayList<String>) {
        Filesystem.loadConfig()
        logger.info("Config file reloaded.")
    }
}
package live.tsradio.daemon.console.commands

import live.tsradio.daemon.console.Command
import live.tsradio.daemon.console.CommandHandler
import live.tsradio.daemon.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class CmdReload: Command("reload", "", "Reload config") {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    override fun execute(name: String, args: ArrayList<String>) {
        Filesystem.loadConfig()
        logger.info("Config file reloaded.")
    }
}
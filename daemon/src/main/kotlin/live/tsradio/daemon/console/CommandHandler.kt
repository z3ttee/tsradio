package live.tsradio.daemon.console

import live.tsradio.daemon.console.commands.CmdChannel
import live.tsradio.daemon.console.commands.CmdHelp
import live.tsradio.daemon.console.commands.CmdPlaylist
import live.tsradio.daemon.console.commands.CmdReload
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object CommandHandler {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    val commands: HashMap<String, Command> = HashMap()

    init {
        commands["help"] = CmdHelp()
        commands["channel"] = CmdChannel()
        commands["reload"] = CmdReload()
        commands["playlist"] = CmdPlaylist()
    }

    fun handle(input: String){
        var parts = input.split(" ")
        val name = parts[0].toLowerCase()
        parts = parts.subList(1, parts.size)

        try {
            val command: Command = commands[name]!!
            command.execute(name, ArrayList(parts))
        } catch (ignored: NullPointerException){
            logger.warn("Could not find command '$name'. Typing 'help' will give you an overview of all commands")
        }
    }

}
package live.tsradio.discordbot.command

import live.tsradio.discordbot.command.sender.Sender
import live.tsradio.discordbot.language.Lang
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message

abstract class Command(val name: String, val usage: String, val description: String, val category: Category, val consoleOptimised: Boolean = false) {
    abstract fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>)

    fun sendUsage(sender: Sender){
        sender.sendError(Lang.getString("error_cmd_usage").replace("%usage%", "$name $usage")).subscribe()
    }
}
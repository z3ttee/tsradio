package live.tsradio.discordbot.command.commands

import live.tsradio.discord.audio.VoiceHandler
import live.tsradio.discordbot.command.Category
import live.tsradio.discordbot.command.Command
import live.tsradio.discordbot.command.sender.DiscordSender
import live.tsradio.discordbot.command.sender.Sender
import live.tsradio.discordbot.language.Lang
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message

class CmdLeave: Command("leave", "", Lang.getString("cmd_leave_description"), Category.MUSIC) {

    override fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>) {
        sender as DiscordSender

        if(!VoiceHandler.hasConnection(guild!!)) {
            sender.sendError(Lang.getString("channel_not_connected")).subscribe()
            return
        }

        VoiceHandler.getQueueManager(guild)!!.stop().subscribe()
        VoiceHandler.closeConnection(guild).subscribe {
            if(it) sender.sendText(Lang.getString("channel_left")).subscribe()
        }
    }
}
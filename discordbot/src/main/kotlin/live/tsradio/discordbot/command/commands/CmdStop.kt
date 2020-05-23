package live.tsradio.discordbot.command.commands

import live.tsradio.discord.audio.VoiceHandler
import live.tsradio.discordbot.command.Category
import live.tsradio.discordbot.command.Command
import live.tsradio.discordbot.command.sender.DiscordSender
import live.tsradio.discordbot.command.sender.Sender
import live.tsradio.discordbot.language.Lang
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message

class CmdStop: Command("stop", "", Lang.getString("cmd_stop_description"), Category.MUSIC) {
    override fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>) {
        sender as DiscordSender

        if(!VoiceHandler.hasConnection(guild!!)) {
            sender.sendError(Lang.getString("channel_not_connected")).subscribe()
            return
        }

        if(VoiceHandler.getQueueManager(guild)!!.audioPlayer.playingTrack == null) {
            sender.sendError(Lang.getString("audio_not_sending")).subscribe()
            return
        }

        VoiceHandler.getQueueManager(guild)!!.stop().subscribe()
        sender.sendText(Lang.getString("audio_stopped")).subscribe()
    }
}
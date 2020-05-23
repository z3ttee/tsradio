package live.tsradio.discordbot.command.commands

import live.tsradio.discord.audio.VoiceHandler
import live.tsradio.discord.audio.queue.GuildQueueManager
import live.tsradio.discordbot.command.Category
import live.tsradio.discordbot.command.Command
import live.tsradio.discordbot.command.sender.DiscordSender
import live.tsradio.discordbot.command.sender.Sender
import live.tsradio.discordbot.language.Lang
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message

class CmdPause: Command("pause", "", Lang.getString("cmd_pause_description"), Category.MUSIC) {

    override fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>) {
        sender is DiscordSender

        if(!VoiceHandler.hasConnection(guild!!)) {
            sender.sendError(Lang.getString("channel_not_connected")).subscribe()
            return
        }

        val queueManager: GuildQueueManager = VoiceHandler.getQueueManager(guild)!!

        if(queueManager.queue.isEmpty() && queueManager.audioPlayer.playingTrack == null) {
            sender.sendError(Lang.getString("audio_not_sending")).subscribe()
            return
        }

        queueManager.audioPlayer.isPaused = !queueManager.audioPlayer.isPaused
    }
}
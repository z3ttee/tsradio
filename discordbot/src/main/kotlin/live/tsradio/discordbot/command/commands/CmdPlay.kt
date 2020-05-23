package live.tsradio.discordbot.command.commands

import live.tsradio.discord.audio.VoiceHandler
import live.tsradio.discord.audio.queue.GuildQueueManager
import live.tsradio.discordbot.command.Category
import live.tsradio.discordbot.command.Command
import live.tsradio.discordbot.command.sender.DiscordSender
import live.tsradio.discordbot.command.sender.Sender
import live.tsradio.discordbot.language.Lang
import discord4j.core.`object`.VoiceState
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message
import discord4j.core.`object`.entity.VoiceChannel
import kotlin.collections.ArrayList

class CmdPlay: Command("play", "<ID | Name>", Lang.getString("cmd_play_description"), Category.MUSIC) {
    override fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>) {
        sender as DiscordSender

        if(!VoiceHandler.hasConnection(guild!!)) {
            val voiceState: VoiceState? = sender.member.voiceState.block()

            if(voiceState == null) {
                sender.sendError(Lang.getString("error_need_tobe_in_channel")).subscribe()
                return
            }

            val channel: VoiceChannel? = voiceState.channel.block()
            if(channel == null) {
                sender.sendError(Lang.getString("error_voice_not_found")).subscribe()
                return
            }

            if(VoiceHandler.createConnection(guild, channel, message!!.channel.block()!!).block()!!) {
                sender.sendText(Lang.getString("channel_joined")).subscribe()
            }
        }

        val queueManager: GuildQueueManager = VoiceHandler.getQueueManager(guild)!!

        if(args.size == 0 && queueManager.audioPlayer.isPaused){
            queueManager.audioPlayer.isPaused = false
            return
        } else {
            if(args.size == 0){
                sendUsage(sender)
                return
            }
        }

        if(queueManager.audioPlayer.isPaused) queueManager.audioPlayer.isPaused = false

        if(args.size == 1) {
            message!!.delete().subscribe()

            val stationName = args[0]

            //TODO

            /*if(args.size == 1) {

                if(UrlValidator.getInstance().isValid(url)) {
                    VoiceHandler.playSource(guild, URL(url))
                    return
                }
            }*/
        }
    }
}
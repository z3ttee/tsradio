package live.tsradio.discordbot.command.commands

import live.tsradio.discord.audio.VoiceHandler
import live.tsradio.discordbot.command.Category
import live.tsradio.discordbot.command.Command
import live.tsradio.discordbot.command.sender.DiscordSender
import live.tsradio.discordbot.command.sender.Sender
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message

class CmdCloseConnections: Command("closecons", "", "Closes all active voice connections globally", Category.HIDDEN, true) {
    override fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>) {
        if(sender is DiscordSender) return

        if(VoiceHandler.activeConnections.size == 0) {
            sender.sendError("There are currently no active voice connections")
            return
        }

        sender.sendText("Closing all connections...")
        VoiceHandler.activeConnections.keys.forEach { g -> run{
            val connection = VoiceHandler.activeConnections.remove(g)!!
            connection.disconnect()

            VoiceHandler.textChannels.remove(g)

            val queueManager = VoiceHandler.queueManagers.remove(g)!!
            queueManager.stop()
        }}
        sender.sendText("All connections have been closed.")
        // TODO
    }
}
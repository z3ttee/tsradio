package live.tsradio.discordbot.listener

import live.tsradio.discordbot.command.handler.CommandHandler
import live.tsradio.discordbot.command.sender.DiscordSender
import discord4j.core.event.domain.message.MessageCreateEvent
import discord4j.core.event.domain.message.MessageUpdateEvent

class MessageEventListener {

    fun onMessage(event: MessageCreateEvent){
        try {
            // TODO: Variable prefixes
            if (!event.message.content.get().startsWith("tsr ", false)) return
            if (event.member.get().isBot) return

            val typing = event.message.channel.block()
            typing!!.type().block()

            CommandHandler.handleCommand(event.guild.block(), event.message, event.message.content.get(), DiscordSender(event.member.get(), event.message.channel.block()!!))
        } catch (ignored: Exception){ }
    }

    fun onMessageUpdated(event: MessageUpdateEvent) {

    }
}
package live.tsradio.discordbot

import live.tsradio.discordbot.command.handler.CommandHandler
import live.tsradio.discordbot.command.handler.ConsoleHandler
import live.tsradio.discordbot.config.MainConfig
import live.tsradio.discordbot.language.Lang
import live.tsradio.discordbot.language.Language
import live.tsradio.discordbot.listener.MessageEventListener
import live.tsradio.discordbot.listener.ReadyEventListener
import discord4j.core.DiscordClient
import discord4j.core.event.domain.lifecycle.ReadyEvent
import discord4j.core.event.domain.message.MessageCreateEvent
import discord4j.core.event.domain.message.MessageUpdateEvent
import live.tsradio.discordbot.api.ApiRequest
import live.tsradio.discordbot.utils.CMDInputFinder
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.collections.ArrayList
import kotlin.system.exitProcess

private val logger: Logger = LoggerFactory.getLogger(BotCore::class.java)

fun main() {

}

fun main(args: Array<String>) {
    logger.info("Bot is now starting...")
    val token = CMDInputFinder(args.toCollection(ArrayList())).findValue("token")

    if(token.isNullOrEmpty()) {
        logger.error("A token is needed. Otherwise the bot cannot authenticate on Discord.")
        logger.error("So without a token the bot will not work. Bot is shutting down now...")
        return
    }

    BotCore(token)
}

class BotCore(token: String) {
    companion object {
        var discordClient: DiscordClient? = null
        var avatarURL: String = ""
    }

    init {
        // loading configs
        MainConfig.create()

        // load language
        // TODO: Make it an option via command and config
        Lang.initialize(Language.DE)

        // registering commands
        ConsoleHandler.start()
        CommandHandler.registerCommands()

        ApiRequest().get().subscribe {
            logger.info(it.toJSONString())
        }

        // creating instance of client
        discordClient = DiscordClient.create(token)

        // Getting avatarURL
        try {
            avatarURL = discordClient!!.self.block()!!.avatarUrl
        } catch (ignored: Exception){ }

        // registering events
        discordClient!!.eventDispatcher.on(ReadyEvent::class.java).subscribe { (ReadyEventListener()::onReady)(it) }
        discordClient!!.eventDispatcher.on(MessageCreateEvent::class.java).subscribe { (MessageEventListener()::onMessage)(it) }
        discordClient!!.eventDispatcher.on(MessageUpdateEvent::class.java).subscribe { (MessageEventListener()::onMessageUpdated)(it) }

        // logging in
        discordClient!!.login().block()
    }
}
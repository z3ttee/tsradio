package live.tsradio.discordbot.command.commands

import live.tsradio.discordbot.command.Category
import live.tsradio.discordbot.command.Command
import live.tsradio.discordbot.command.sender.DiscordSender
import live.tsradio.discordbot.command.sender.Sender
import live.tsradio.discordbot.language.Lang
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Message

class CmdStations : Command("stations", "", Lang.getString("cmd_stations_description"), Category.GENERAL) {

    override fun execute(sender: Sender, message: Message?, guild: Guild?, args: ArrayList<String>) {
        sender as DiscordSender

        sender.sendText(Lang.getString("paragraph_overview_sent")).subscribe()

        val overview = Lang.getString("headline_stations")+"\n"

        val chunkedOverview = overview.chunked(1500)
        for(chunk in chunkedOverview) {
            sender.sendText(chunk).block()
        }
    }

}
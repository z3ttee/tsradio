package live.tsradio.daemon.console.commands

import live.tsradio.daemon.channel.Channel
import live.tsradio.daemon.console.Command
import live.tsradio.daemon.console.CommandHandler
import live.tsradio.daemon.channel.ChannelHandler
import live.tsradio.daemon.console.CMDInputFinder
import live.tsradio.daemon.database.MySQL
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.sound.Playlist
import live.tsradio.daemon.sound.PlaylistHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.collections.ArrayList

class CmdChannel: Command("channel", "<help|list|create|delete|edit|start|restart|stop|forcestop>", "Manage channels") {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    override fun execute(name: String, args: ArrayList<String>) {
        if(args.size < 1){
            sendUsage()
            return
        }

        if(args[0].equals("help", true)) {
            logger.info("Attribute help: ")
            logger.info("[-n] Name of the channel")
            logger.info("[-d] Description of the channel")
            logger.info("[-c] Creator of the channel")
            logger.info("[-m] Mount of the channel")
            logger.info("[-s | -!s] Activate shuffle")
            logger.info("[-l | -!l] Activate loop")
            logger.info("[-p] Bind a playlistUUID")
            logger.info("[-r] Restart/Start after edited/created")
            return
        }

        /*if(args[0].equals("create",true)) {
            val inputFinder = CMDInputFinder(args)

            val channelName = inputFinder.findValue("n") ?: "unknown"
            val description = inputFinder.findTillNext("d") ?: "No description"
            val mount = inputFinder.findValue("m")
            val playlistName = inputFinder.findValue("p") ?: ""
            val creator = inputFinder.findTillNext("c") ?: "System"
            val shuffle = !inputFinder.findExists("s") || !inputFinder.findExists("!s")
            val loop = !inputFinder.findExists("l") || !inputFinder.findExists("!l")

            if(mount.isNullOrEmpty()) {
                logger.warn("Mountpoint required in order to create channel.")
                return
            }

            var playlistID = ""
            if(!PlaylistHandler.playlistExistsByName(playlistName)) {
                logger.info("The specified playlist does not exist. Creating it...")
                val pID = UUID.randomUUID().toString()
                PlaylistHandler.createPlaylist(Playlist(playlistName, pID, creator, ArrayList()))
                playlistID = pID
            } else {
                val result = MySQL.get(MySQL.tablePlaylists, "name = '$playlistName'", ArrayList(listOf("id")))
                if(result != null && result.next()) {
                    playlistID = result.getString("id")
                }
            }

            if(playlistID.isEmpty()) {
                logger.error("Error occured: Playlist does not exist")
                return
            }

            val
            val channel = Channel(
                    Filesystem.preferences.node.nodeID,
                    UUID.randomUUID().toString(),
                    channelName,
                    description,
                    creator,
                    "/"+mount.removeSuffix("/").removePrefix("/"),
                    playlistID,
                    shuffle,
                    loop,
                    ArrayList())
            if(ChannelHandler.channelExistsByName(channelName)){
                logger.warn("Channel '${channel.channelName}' already exists.")
                return
            }

            if(ChannelHandler.channelExistsByMount(mount)) {
                logger.warn("Channel with mount '$mount' already exists.")
                return
            }

            ChannelHandler.createChannel(channel)
            return
        }*/

        if(args[0].equals("delete",true)) {
            if(args.size < 1) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <channel_name>")
                return
            }

            val channelName = args[1]

            if(!ChannelHandler.channelExistsByName(channelName)) {
                logger.warn("Channel '$channelName' does not exist.")
                return
            }

            ChannelHandler.deleteChannel(ChannelHandler.getChannelOnNodeByName(channelName)!!)
            return
        }

        /*if(args[0].equals("edit",true)) {
            if(args.size < 2) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <channel_name> [params: See 'channel help']")
                return
            }
            val channelName = args[1]

            if(!ChannelHandler.channelExistsByName(channelName)) {
                logger.warn("Channel '$channelName' does not exist.")
                return
            }

            val channel = ChannelHandler.getChannelOnNodeByName(channelName)!!
            val inputFinder = CMDInputFinder(args)

            val channelNameNew = inputFinder.findValue("n") ?: channelName
            val description = inputFinder.findTillNext("d") ?: channel.description
            val mount = inputFinder.findValue("m") ?: channel.mountpoint
            val playlistName = inputFinder.findValue("p")
            val creator = inputFinder.findTillNext("c") ?: channel.creatorID
            val shuffle = !inputFinder.findExists("s") || !inputFinder.findExists("!s")
            val loop = !inputFinder.findExists("l") || !inputFinder.findExists("!l")

            var playlistID = channel.playlistID
            if(!playlistName.isNullOrEmpty()) {
                val result = MySQL.get(MySQL.tablePlaylists, "name = '$playlistName'", ArrayList(listOf("id")))
                if(result != null && result.next()) {
                    playlistID = result.getString("id")
                }
            }

            channel.channelName = channelNameNew
            channel.description = description
            channel.mountpoint = mount
            channel.playlistID = playlistID
            channel.creatorID = creator
            channel.shuffle = shuffle
            channel.loop = loop

            ChannelHandler.editChannel(channelName, channel.channelID, channel)
            return
        }*/

        /*if(args[0].equals("list",true)) {
            logger.info("[]========= Active Channels =========[]")

            if(ChannelHandler.activeChannels.isEmpty()){
                logger.info("No channels currently running or nothing found.")
            } else {
                for(channel in ChannelHandler.activeChannels.values){
                    logger.info(">> [${channel.id}]: ${channel.channelName} - ${channel.description} ")
                }
            }

            logger.info(" ")
            logger.info("[]========= Inactive Channels =========[]")

            if(ChannelHandler.configuredChannels.isEmpty()){
                logger.info("No channels currently inactive or nothing found.")
            } else {
                for(channel in ChannelHandler.configuredChannels.values){
                    if(!ChannelHandler.activeChannels.containsKey(channel.channelID)) {
                        logger.info(">> ${channel.channelName} - ${channel.description} ")
                    }
                }
            }
            return
        }*/

        if(args[0].equals("start",true)) {
            if(args.size != 2) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <channel_name>")
                return
            }

            if(ChannelHandler.activeChannels.size >= Filesystem.preferences.channels.max) {
                logger.warn("The limit of active channels simultaneously is reached! [max: ${Filesystem.preferences.channels.max}]")
                return
            }
            ChannelHandler.startChannel(args[1])
            return
        }
        if(args[0].equals("restart",true)) {
            if(args.size != 2) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <channel_name>")
                return
            }
            ChannelHandler.restartChannel(args[1])
            return
        }
        if(args[0].equals("stop",true)) {
            if(args.size != 2) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <channel_name>")
                return
            }
            ChannelHandler.stopChannel(args[1], false)
            return
        }
        if(args[0].equals("forcestop",true)) {
            if(args.size != 2) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <channel_name>")
                return
            }
            ChannelHandler.stopChannel(args[1], true)
            return
        }

        logger.warn("Could not handle argument '${args[0]}'")
    }
}
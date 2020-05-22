package live.tsradio.daemon.console.commands

import live.tsradio.daemon.console.Command
import live.tsradio.daemon.console.CommandHandler
import live.tsradio.daemon.channel.PlaylistHandler
import live.tsradio.daemon.console.CMDInputFinder
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.sound.Playlist
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class CmdPlaylist: Command("playlist", "<help|list|create|delete|edit>", "Manage playlists") {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    override fun execute(name: String, args: ArrayList<String>) {
        if(args.size < 1){
            sendUsage()
            return
        }

        if(args[0].equals("help", true)) {
            logger.info("Attribute help: ")
            logger.info("[-n] Name of the playlist")
            logger.info("[-c] Creator of the playlist")
            logger.info("[-d] Directory of the playlist on node (Always in /playlists/...)")
            return
        }

        if(args[0].equals("create",true)) {
            val inputFinder = CMDInputFinder(args)

            val playlistName = inputFinder.findValue("n") ?: "unknown"
            val creator = inputFinder.findTillNext("c") ?: "SYSTEM"
            val directory = inputFinder.findTillNext("d")

            if(directory.isNullOrEmpty()) {
                logger.warn("Directory required in order to create channel.")
                return
            }

            val playlist = Playlist(Filesystem.preferences.node.nodeID, playlistName, creator, directory.removePrefix("/"), ArrayList())
            if(PlaylistHandler.playlistExistsByName(playlistName)){
                logger.warn("Playlist '${playlistName}' already exists.")
                return
            }

            PlaylistHandler.createPlaylist(playlist)
            return
        }

        if(args[0].equals("delete",true)) {
            if(args.size < 1) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <playlist_name>")
                return
            }

            val playlistName = args[1]

            if(!PlaylistHandler.playlistExistsByName(playlistName)) {
                logger.warn("Playlist '$playlistName' does not exist.")
                return
            }

            PlaylistHandler.deletePlaylist(PlaylistHandler.getPlaylistByName(playlistName))
            return
        }

        if(args[0].equals("edit",true)) {
            if(args.size < 2) {
                sendText("Syntax: $name ${args[0].toLowerCase()} <playlist_name> [params: See 'playlist help']")
                return
            }
            val playlistName = args[1]

            if(!PlaylistHandler.playlistExistsByName(playlistName)) {
                logger.warn("Playlist '$playlistName' does not exist.")
                return
            }

            val playlist = PlaylistHandler.getPlaylistByName(playlistName)
            val inputFinder = CMDInputFinder(args)

            if(inputFinder.findExists("n")) {
                logger.warn("Cannot edit the name of a playlist")
                return
            }

            val creator = inputFinder.findTillNext("c") ?: playlist.creator
            val directory = inputFinder.findTillNext("d") ?: playlist.directory

            playlist.creator = creator
            playlist.directory = directory.removePrefix("/")

            PlaylistHandler.editPlaylist(playlistName, playlist)
            return
        }

        if(args[0].equals("list",true)) {
            logger.info("[]========= Playlists on this node =========[]")

            if(PlaylistHandler.configuredPlaylists.isEmpty()){
                logger.info("No playlists found on this node.")
            } else {
                for(playlist in PlaylistHandler.configuredPlaylists.values){
                    logger.info(">> ${playlist.name} - ${playlist.directoryAsFile.absolutePath} ")
                }
            }
            return
        }

        logger.warn("Could not handle argument '${args[0]}'")
    }
}
package live.tsradio.nodeserver.console.commands

import live.tsradio.nodeserver.console.Command
import live.tsradio.nodeserver.console.CommandHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import kotlin.collections.ArrayList

// TODO: New mysql system
class CmdPlaylist: Command("playlist", "<help|list|create|delete|edit>", "Manage playlists") {
    private val logger: Logger = LoggerFactory.getLogger(CommandHandler::class.java)

    override fun execute(name: String, args: ArrayList<String>) {
        if(args.size < 1){
            sendUsage()
            return
        }

        /*if(args[0].equals("help", true)) {
            logger.info("Attribute help: ")
            logger.info("[-n] Name of the playlist")
            logger.info("[-c] Creator of the playlist")
            return
        }

        if(args[0].equals("create",true)) {
            val inputFinder = CMDInputFinder(args)

            val playlistName = inputFinder.findValue("n")
            val creator = inputFinder.findTillNext("c") ?: "System"

            if(playlistName.isNullOrEmpty()) {
                logger.warn("Name required in order to create channel.")
                return
            }

            val playlist = Playlist(playlistName, UUID.randomUUID().toString(), creator, ArrayList())
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

            PlaylistHandler.deletePlaylist(PlaylistHandler.getPlaylistOnNodeByName(playlistName)!!)
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

            val playlist = PlaylistHandler.getPlaylistOnNodeByName(playlistName)
            val inputFinder = CMDInputFinder(args)

            if(playlist != null) {
                val creator = inputFinder.findValue("c") ?: playlist.creatorID
                val directory = inputFinder.findValue("n") ?: playlist.name

                playlist.creatorID = creator
                playlist.name = directory.removePrefix("/")

                PlaylistHandler.editPlaylist(playlistName, playlist)
            }
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

        logger.warn("Could not handle argument '${args[0]}'")*/
    }
}
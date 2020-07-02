package live.tsradio.nodeserver.sound

import live.tsradio.nodeserver.channel.ChannelHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.ResultSet

// TODO: New mysql system
object PlaylistHandler {
    private val logger: Logger = LoggerFactory.getLogger(PlaylistHandler::class.java)

    val configuredPlaylists: HashMap<String, Playlist> = HashMap()

    fun notifyPlaylistUpdated(playlist: Playlist){
        configuredPlaylists[playlist.id] = playlist

        for(channel in ChannelHandler.activeChannels.values){
            if(channel.data.playlistID == playlist.id){
                channel.reload()
            }
        }
    }
    fun notifyPlaylistDeleted(playlist: Playlist){
        if(configuredPlaylists.containsKey(playlist.id)) configuredPlaylists.remove(playlist.id)

        for(channel in ChannelHandler.activeChannels.values){
            if(channel.data.playlistID == playlist.id){
                channel.reload()
            }
        }
    }

    fun createPlaylist(playlist: Playlist){
        /*try {
            MySQL.insert(MySQL.tablePlaylists, playlist.toContentValues())
            notifyPlaylistUpdated(playlist)
            logger.info("Playlist '${playlist.name}' created.")
        } catch (ex: Exception) {
            logger.info("Creating playlist '${playlist.name}' failed: ${ex.message}")
        }*/
    }

    fun mysqlResultToPlaylist(result: ResultSet): Playlist {
        return Playlist(
                result.getString("name"),
                result.getString("id"),
                result.getString("creatorID"),
                ArrayList(result.getString("genres").split(";"))
        )
    }

    fun deletePlaylist(playlist: Playlist) {
        /*try {
            MySQL.delete(MySQL.tablePlaylists, "id = '${playlist.id}'")
            notifyPlaylistDeleted(playlist)
            logger.info("Playlist '${playlist.name}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting playlist '${playlist.name}' failed: ${ex.message}")
        }*/
    }

    fun editPlaylist(name: String, playlist: Playlist) {
        /*try {
            MySQL.update(MySQL.tablePlaylists, "id = '${playlist.id}'", playlist.toContentValues())
            notifyPlaylistUpdated(playlist)
            logger.info("Playlist '$name' edited.")
        } catch (ex: Exception) {
            ex.printStackTrace()
            logger.info("Editing channel '$name' failed: ${ex.message}")
        }*/
    }

    fun playlistExistsByName(name: String): Boolean {
        /*configuredPlaylists.values.forEach { if(it.name == name) return true }
        return try {
            MySQL.exists(MySQL.tablePlaylists, "name = '$name'")
        } catch (ignored: Exception) {
            ignored.printStackTrace()
            false
        }*/
        return false
    }

    fun getPlaylistOnNodeByName(name: String): Playlist? {
        /*val result = MySQL.get(MySQL.tablePlaylists, "name = '$name'", ArrayList(listOf("*")), 1)

        return if(result != null && result.next()) {
            mysqlResultToPlaylist(result)
        } else {
            null
        }*/
        return null
    }
}
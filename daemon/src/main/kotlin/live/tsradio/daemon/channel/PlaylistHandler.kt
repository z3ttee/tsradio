package live.tsradio.daemon.channel

import com.google.cloud.firestore.SetOptions
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.sound.Playlist
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object PlaylistHandler {
    private val logger: Logger = LoggerFactory.getLogger(PlaylistHandler::class.java)

    val configuredPlaylists: HashMap<String, Playlist> = HashMap()

    fun createPlaylist(playlist: Playlist){
        try {
            Filesystem.getPlaylistCollection().document().set(playlist.toPOJO(), SetOptions.merge()).get()
            logger.info("Playlist '${playlist.name}' created.")
        } catch (ex: Exception) {
            logger.info("Creating playlist '${playlist.name}' failed: ${ex.message}")
        }
    }

    fun deletePlaylist(playlist: Playlist) {
        try {
            configuredPlaylists.remove(playlist.name)
            Filesystem.getPlaylistCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("name", playlist.name).get().get().documents[0].reference.delete().get()
            logger.info("Playlist '${playlist.name}' deleted.")
        } catch (ex: Exception) {
            logger.info("Deleting playlist '${playlist.name}' failed: ${ex.message}")
        }
    }

    fun editPlaylist(name: String, playlist: Playlist) {
        try {
            Filesystem.getPlaylistCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("name", playlist.name).get().get().documents[0].reference.set(playlist.toPOJO(), SetOptions.merge())
            logger.info("Playlist '$name' edited.")
        } catch (ex: Exception) {
            ex.printStackTrace()
            logger.info("Editing channel '$name' failed: ${ex.message}")
        }
    }

    fun playlistExistsByName(name: String): Boolean {
        if(configuredPlaylists.containsKey(name)) return true
        return try {
            Filesystem.getPlaylistCollection().whereEqualTo("name", name).get().get().documents[0].exists()
        } catch (ignored: Exception) {
            false
        }
    }
    fun getPlaylistByName(name: String): Playlist {
        return configuredPlaylists.getOrElse(name,  {
            return@getOrElse Filesystem.getPlaylistCollection().whereEqualTo("nodeID", Filesystem.preferences.node.nodeID).whereEqualTo("name", name).get().get().documents[0].toObject(Playlist.PlaylistPOJO::class.java).toPlaylist()
        })
    }
}
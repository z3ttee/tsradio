package live.tsradio.daemon.sound

import com.google.cloud.firestore.annotation.Exclude
import live.tsradio.daemon.files.Filesystem
import java.io.File

data class Playlist(
    var nodeID: String = Filesystem.preferences.node.nodeID,
    var name: String,
    var creator: String,
    var directory: String,
    var genres: ArrayList<Genre>
) {
    @Exclude val directoryAsFile = File(Filesystem.playlistDirectory.absolutePath+File.separator+directory)

    fun toPOJO(): PlaylistPOJO {
        return PlaylistPOJO(nodeID, name,creator,directory,genres)
    }
    fun liveUpdate(playlist: Playlist){
        this.nodeID = playlist.nodeID
        this.name = playlist.name
        this.creator = playlist.creator
        this.directory = playlist.directory
        this.genres = playlist.genres
    }

    class PlaylistPOJO {

        var nodeID: String = Filesystem.preferences.node.nodeID
        var name: String = "unknown"
        var creator: String = "SYSTEM"
        var directory: String = "/"
        var genres: ArrayList<Genre> = ArrayList()

        constructor()
        constructor(_nodeID: String, _name: String, _creator: String, _directory: String, _genres: ArrayList<Genre>) {
            this.nodeID = _nodeID
            this.name = _name
            this.creator = _creator
            this.directory = _directory
            this.genres = _genres
        }

        fun toPlaylist(): Playlist {
            return Playlist(nodeID, name, creator, directory, genres)
        }
    }
}
package live.tsradio.daemon.sound

import live.tsradio.daemon.files.Filesystem
import java.io.File

data class Playlist(
    var name: String,
    var path: String,
    var creator: String,
    var genres: ArrayList<Genre>
) {
    val directoryAsFile = File(Filesystem.playlistDirectory.absolutePath+File.separator+path.removePrefix("/").removeSuffix("/").replace("/", File.separator).replace("\\", "")+File.separator)

    fun liveUpdate(playlist: Playlist){
        this.name = playlist.name
        this.path = playlist.path
        this.creator = playlist.creator
        this.genres = playlist.genres
    }
}
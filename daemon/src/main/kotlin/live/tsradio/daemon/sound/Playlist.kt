package live.tsradio.daemon.sound

import com.google.cloud.firestore.annotation.Exclude
import live.tsradio.daemon.files.Filesystem
import java.io.File

data class Playlist(
    val name: String,
    val creator: String,
    val directory: String,
    val genres: ArrayList<Genre>
) {
    @Exclude val directoryAsFile = File(Filesystem.playlistDirectory.absolutePath, directory)
}
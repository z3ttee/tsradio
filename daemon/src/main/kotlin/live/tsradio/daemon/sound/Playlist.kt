package live.tsradio.daemon.sound

import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.files.Filesystem
import org.apache.commons.io.FileUtils
import java.io.File
import java.util.*
import kotlin.collections.ArrayList

data class Playlist(
        var name: String,
        var id: String = UUID.randomUUID().toString(),
        var creatorID: String = "System",
        var genres: ArrayList<String> = ArrayList()
) {
    var directoryAsFile: File = File(Filesystem.playlistDirectory.absolutePath+File.separator+(id+"-"+name.toLowerCase()).removePrefix("/").removeSuffix("/").replace("/", File.separator).replace("\\", "")+File.separator)

    fun liveUpdate(playlist: Playlist){
        // Update directory name if exists
        if(name != playlist.name) {
            val newDir = File(Filesystem.playlistDirectory.absolutePath+File.separator+(playlist.id+"-"+playlist.name.toLowerCase()).removePrefix("/").removeSuffix("/").replace("/", File.separator).replace("\\", "")+File.separator)

            newDir.setWritable(true)
            newDir.setReadable(true)

            FileUtils.forceMkdir(newDir)
            FileUtils.copyDirectoryToDirectory(directoryAsFile, newDir)
            FileUtils.forceDelete(directoryAsFile)
            directoryAsFile = newDir
        }

        this.name = playlist.name
        this.id = playlist.id
        this.creatorID = playlist.creatorID
        this.genres = playlist.genres
    }

    fun toContentValues(): ContentValues {
        val values = ContentValues()
        values["id"] = id.replace("-", "")
        values["name"] = name
        values["creatorID"] = creatorID.replace("-", "")
        values["genres"] = genres.joinToString(";")
        return values
    }
}
package live.tsradio.daemon.files

import com.google.gson.GsonBuilder
import live.tsradio.daemon.channel.Channel
import live.tsradio.daemon.channel.ChannelHandler
import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.database.MySQL
import live.tsradio.daemon.exception.CannotLoadConfigException
import live.tsradio.daemon.exception.MissingFileException
import live.tsradio.daemon.sound.PlaylistHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.*

object Filesystem {
    private val logger: Logger = LoggerFactory.getLogger(Filesystem::class.java)

    val rootDirectory: File = File(System.getProperty("user.dir"))
    val playlistDirectory: File = File(rootDirectory.absolutePath+File.separator+"playlists")
    val preferencesFile: File = File(rootDirectory.absolutePath, "preferences.json")

    var preferences: Preferences = Preferences()

    val genres: HashMap<String, Channel> = HashMap()
    val playlists: HashMap<String, Channel> = HashMap()

    init {
        // Create playlists directory
        if(!playlistDirectory.exists()) {
            playlistDirectory.mkdirs()
        }

        // Load config
        loadConfig()
        loadPlaylists()
        loadChannels()
    }

    fun loadConfig(){
        preferencesFile.setReadable(true)
        preferencesFile.setWritable(true)

        if(!preferencesFile.exists()) {
            if(!preferencesFile.createNewFile()) throw CannotLoadConfigException()

            val preferences = Preferences()

            val gson = GsonBuilder().setPrettyPrinting().create()
            val writer = FileWriter(preferencesFile)
            writer.write(gson.toJson(preferences))
            writer.flush()
            writer.close()
        }

        this.preferences = GsonBuilder().create().fromJson(FileReader(preferencesFile), Preferences::class.java)
        preferences.node.nodeID = preferences.node.nodeID.replace("-", "")

        if(MySQL.exists(MySQL.tableNodes, "id = '${preferences.node.nodeID}'")) {
            val contentValues = ContentValues()
            contentValues["lastLogin"] = System.currentTimeMillis().toString()
            MySQL.update(MySQL.tableNodes, "id = '${preferences.node.nodeID}'", contentValues)
        } else {
            val contentValues = ContentValues()
            contentValues["id"] = preferences.node.nodeID
            contentValues["name"] = preferences.node.nodeID
            contentValues["lastLogin"] = System.currentTimeMillis().toString()
            MySQL.insert(MySQL.tableNodes, contentValues)
        }

    }
    fun loadChannels(){
        Thread(Runnable { 
            val cursor = MySQL.get(MySQL.tableChannels, "nodeID = '${preferences.node.nodeID}'", ArrayList(listOf("*")), 0)
            if(cursor != null) {
                while (cursor.next()) {
                    val channel = ChannelHandler.mysqlResultToChannel(cursor)
                    ChannelHandler.notifyChannelUpdated(channel)
                }
                cursor.close()
            }
        }).start()
    }
    fun loadPlaylists(){
        Thread(Runnable {
            val cursor = MySQL.get(MySQL.tablePlaylists, "", ArrayList(listOf("*")), 0)
            if(cursor != null) {
                while (cursor.next()) {
                    val playlist = PlaylistHandler.mysqlResultToPlaylist(cursor)
                    PlaylistHandler.notifyPlaylistUpdated(playlist)
                }
                cursor.close()
            }
        }).start()
    }
}
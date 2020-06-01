package live.tsradio.daemon.files

import com.google.gson.GsonBuilder
import live.tsradio.daemon.channel.Channel
import live.tsradio.daemon.channel.ChannelHandler
import live.tsradio.daemon.database.MySQL
import live.tsradio.daemon.exception.CannotLoadConfigException
import live.tsradio.daemon.exception.MissingFileException
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
        loadChannels()
    }

    fun loadConfig(){
        preferencesFile.setReadable(true)
        preferencesFile.setWritable(true)

        if(!preferencesFile.exists()) {
            if(!preferencesFile.createNewFile()) throw CannotLoadConfigException()

            val gson = GsonBuilder().setPrettyPrinting().create()
            val writer = FileWriter(preferencesFile)
            writer.write(gson.toJson(Preferences()))
            writer.flush()
            writer.close()
        }

        this.preferences = GsonBuilder().create().fromJson(FileReader(preferencesFile), Preferences::class.java)
    }
    fun loadChannels(){
        Thread(Runnable { 
            val cursor = MySQL.get(MySQL.tableChannels, "nodeID = '${preferences.node.nodeID}'", ArrayList(listOf("*")), 0)
            if(cursor != null) {
                while (cursor.next()) {
                    val channel = ChannelHandler.mysqlResultToChannel(cursor)
                    ChannelHandler.configuredChannels[channel.channelID] = channel
                }
                cursor.close()
            }
        }).start()
    }
    fun loadPlaylists(){
        Thread(Runnable {

        }).start()
    }
}
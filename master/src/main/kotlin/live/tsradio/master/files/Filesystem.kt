package live.tsradio.master.files

import com.google.gson.GsonBuilder
import live.tsradio.master.exception.CannotLoadConfigException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.*

object Filesystem {
    private val logger: Logger = LoggerFactory.getLogger(Filesystem::class.java)

    private val rootDirectory: File = File(System.getProperty("user.dir"))
    val keyStoreFile: File = File(rootDirectory.absolutePath, "keystore.jks")
    private val preferencesFile: File = File(rootDirectory.absolutePath, "preferences.json")

    var preferences: Preferences = Preferences()

    //val genres: HashMap<String, Channel> = HashMap()
    //val playlists: HashMap<String, Channel> = HashMap()

    init {
        // Load config
        loadConfig()
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

        preferences = GsonBuilder().create().fromJson(FileReader(preferencesFile), Preferences::class.java)
    }
}
package live.tsradio.master.files

import com.google.gson.GsonBuilder
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.*
import kotlin.system.exitProcess

object Filesystem {
    private val logger: Logger = LoggerFactory.getLogger(Filesystem::class.java)

    val rootDirectory: File = File(System.getProperty("user.dir"))
    val scriptsDirectory: File = File(System.getProperty("user.dir")+File.separator+"scripts")
    private val preferencesFile: File = File(rootDirectory.absolutePath, "preferences.json")

    var preferences: Preferences = Preferences()

    init {
        // Load config
        loadConfig()
    }

    private fun loadConfig(){
        preferencesFile.setReadable(true)
        preferencesFile.setWritable(true)

        if(!preferencesFile.exists()) {
            if(!preferencesFile.createNewFile()) throw FileNotFoundException("preferences.json not found")

            val gson = GsonBuilder().setPrettyPrinting().create()
            val writer = FileWriter(preferencesFile)
            writer.write(gson.toJson(Preferences()))
            writer.flush()
            writer.close()

            Thread.sleep(1000)
            logger.info("A completely unmodified preferences file has been created.")
            logger.info("You may first want to configure it to your needs before using it.")
            logger.info("Shutting down in 10s...")

            Thread.sleep(1000*10)
            exitProcess(0)
        }

        preferences = GsonBuilder().create().fromJson(FileReader(preferencesFile), Preferences::class.java)
    }
}
package live.tsradio.master

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.google.gson.stream.JsonReader
import live.tsradio.master.database.MySQL
import live.tsradio.master.files.Filesystem
import live.tsradio.master.utils.CMDInputFinder
import live.tsradio.master.installer.ServiceInstaller
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.InputStreamReader
import kotlin.collections.ArrayList
import kotlin.system.exitProcess

private val logger: Logger = LoggerFactory.getLogger(Master::class.java)

fun main(args: Array<String>) {
    val inputFinder = CMDInputFinder(args.toCollection(ArrayList()))

    if(inputFinder.findExists("installService", false)) {
        ServiceInstaller().installAsService(inputFinder.findValue("user", false).toString())
        exitProcess(0)
    } else {
        Master()
    }
}

class Master {

    companion object {
        var appInfo: JsonObject = JsonParser().parse(JsonReader(InputStreamReader(Thread.currentThread().contextClassLoader.getResourceAsStream("appinfo.json")!!))).asJsonObject
    }

    init {
        println(" ")
        println("[]====================================[]")
        println("  Welcome to ${appInfo["name"].asString} v${appInfo["version"].asString}")
        println("  Developed by: ${appInfo["author"].asString}")
        println("  Last built: ${appInfo["buildTime"].asString}")
        println("[]====================================[]")
        println("  Visit me on GitHub: ${appInfo["github"].asString}")
        println(" ")
        println(" ")

        logger.info("Initializing...")
        Filesystem.initialize()
        MySQL.setup()
        SocketServer.start()

        if(Filesystem.daemonFile.exists()) {
            logger.info("Daemon executable detected. Starting daemon...")
            // TODO: Start daemon
        }

        Thread.currentThread().join()
        //logger.info(NodeDataPacket(NodeServer(UUID.randomUUID(), "defsult", System.currentTimeMillis())).toJSON())
    }

}
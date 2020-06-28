package live.tsradio.master

import live.tsradio.master.files.Filesystem
import live.tsradio.master.utils.CMDInputFinder
import live.tsradio.master.installer.ServiceInstaller
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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

    }

    init {
        logger.info("Starting...")
        Filesystem.initialize()
    }

}
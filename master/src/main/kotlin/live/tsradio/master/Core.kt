package live.tsradio.master

import live.tsradio.master.console.CommandHandler
import live.tsradio.master.console.ConsoleHandler
import live.tsradio.master.exception.ExceptionHandler
import live.tsradio.master.files.Filesystem
import live.tsradio.master.protocol.TLSServer
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.net.URI
import java.util.concurrent.TimeUnit

fun main() {
    Core()
}

class Core {
    private val logger: Logger = LoggerFactory.getLogger(Core::class.java)

    init {
        try {

            logger.info("Initializing master...")

            // Init handlers
            Filesystem
            CommandHandler
            ConsoleHandler().start()

            logger.info(Filesystem.keyStoreFile.absolutePath)
            /*System.setProperty("jetty.http.port", "80")
            System.setProperty("jetty.ssl.port", "443")*/

            // System.setProperty("javax.net.debug", "ssl")

            logger.info(System.getProperty("java.home"))


            // TLSServer().serve()

            // Thread.currentThread().join()
            logger.info("Master execution finished. Shut down.")
        } catch (ex: Exception){
            ExceptionHandler(ex).handle()
        } catch (ex: ExceptionInInitializerError){
            ExceptionHandler(ex.exception).handle()
        }
    }
}
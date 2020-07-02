package live.tsradio.nodeserver

import live.tsradio.nodeserver.api.auth.AccountType
import live.tsradio.nodeserver.api.auth.AuthPacket
import live.tsradio.nodeserver.console.CommandHandler
import live.tsradio.nodeserver.console.ConsoleHandler
import live.tsradio.nodeserver.exception.ExceptionHandler
import live.tsradio.nodeserver.files.Filesystem
import live.tsradio.nodeserver.utils.MySQL
import org.slf4j.Logger
import org.slf4j.LoggerFactory

fun main() {
    Core()
}

class Core {
    companion object {
        private val logger: Logger = LoggerFactory.getLogger(Core::class.java)
        var authData: AuthPacket = AuthPacket(Filesystem.preferences.node.clientID, Filesystem.preferences.node.clientKey, AccountType.ACCOUNT_NODE)
    }

    init {
        try {
            logger.info("Starting daemon...")

            // Init handlers
            CommandHandler
            MySQL
            ConsoleHandler().start()

            logger.info("Starting SocketClient...")
            SocketClient.start()

            Thread.currentThread().join()
            logger.info("Daemon shut down.")
        } catch (ex: ExceptionInInitializerError) {
            ExceptionHandler(ex.exception).handle()
        } catch (ex: Exception){
            ExceptionHandler(ex).handle()
        }
    }
}
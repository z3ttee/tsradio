package live.tsradio.nodeserver.files

import java.util.*

class PreferenceSections {

    class GeneralSettings(
            var clientID: UUID = UUID.randomUUID(),
            var clientKey: String = "")

    // TODO: Centralise config through master
    class IcecastSettings(
            val host: String = "localhost",
            val sourceUsername: String = "source",
            val sourcePassword: String = "hackme",
            val port: Int = 8000)

    // TODO: Centralise config through master
    class ChannelSettings(
            val max: Int = 4,
            val waitForQueue: Boolean = true,
            val autostart: Boolean = true,
            val autorestart: Boolean = true,
            val restartTries: Int = 3,
            val restartDelay: Int = 20)

    class MySQLSettings(
            val host: String = "localhost",
            val port: Int = 3306,
            val database: String = "dbname",
            val username: String = "user",
            val password: String = "pass",
            val prefix: String = "tsr_")

    class MasterSettings(
            var ssl: Boolean = false,
            val host: String = "localhost",
            val port: Int = 9092)
}
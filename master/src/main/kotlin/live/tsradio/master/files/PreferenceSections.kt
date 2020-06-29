package live.tsradio.master.files

import java.util.*

class PreferenceSections {

        class GeneralSettings(
                var nodeID: String = UUID.randomUUID().toString(),
                var sessionHash: String = "")

        class IcecastSettings(
                val host: String = "localhost",
                val sourceUsername: String = "source",
                val sourcePassword: String = "hackme",
                val port: Int = 8000)

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
                var privateKeyPassword: String = "hackme",
                val host: String = "localhost",
                val port: Int = 9092)
}
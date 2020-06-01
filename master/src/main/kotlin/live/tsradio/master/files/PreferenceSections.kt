package live.tsradio.master.files

import java.util.*

class PreferenceSections {

    class GeneralSettings(
        val nodeID: String = UUID.randomUUID().toString())

    class IcecastSettings(
        val host: String = "localhost",
        val sourceUsername: String = "source",
        val sourcePassword: String = "hackme",
        val port: Int = 8000)

    class MySQLSettings(
        val host: String = "localhost",
        val database: String = "database",
        val username: String = "username",
        val password: String = "password",
        val port: Int = 3306)

    class RedisSettings(
            val host: String = "localhost",
            val username: String = "username",
            val password: String = "password",
            val port: Int = 6379)

    class SocketSettings(
            val host: String = "localhost",
            val username: String = "username",
            val password: String = "password",
            val port: Int = 6379)
}
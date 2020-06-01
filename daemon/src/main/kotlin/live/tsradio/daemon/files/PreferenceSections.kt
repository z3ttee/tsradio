package live.tsradio.daemon.files

import java.util.*

class PreferenceSections {

    class GeneralSettings(
        val nodeID: String = UUID.randomUUID().toString().replace("-", ""))

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
            val apiVersion: Int = 1,
            val host: String = "localhost",
            val port: Int = 3306,
            val database: String = "dbname",
            val username: String = "user",
            val password: String = "pass",
            val prefix: String = "tsr_")

    class RedisSettings(
            val channelCollection: String = "channels",
            val playlistCollection: String = "playlists",
            val genreCollection: String = "genres",
            val channelInfoCollection: String = "channelInfo")
}
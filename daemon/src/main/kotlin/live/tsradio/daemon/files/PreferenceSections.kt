package live.tsradio.daemon.files

import java.util.*

class PreferenceSections {

    class GeneralSettings(
        val configVersion: Int = 1,
        val nodeID: String = UUID.randomUUID().toString())

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

    class FirestoreSettings(
        val channelCollection: String = "channels",
        val playlistCollection: String = "playlists",
        val genreCollection: String = "genres",
        val realtimeInfoCollection: String = "realtimeInfo")
}
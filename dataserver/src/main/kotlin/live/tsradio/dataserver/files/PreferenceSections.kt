package live.tsradio.dataserver.files

class PreferenceSections {

    class MySQLSettings(
            val apiVersion: Int = 1,
            val host: String = "localhost",
            val port: Int = 3306,
            val database: String = "dbname",
            val username: String = "user",
            val password: String = "pass",
            val prefix: String = "tsr_")

    class DataserverSettings(
            val ssl: Boolean = true,
            val host: String = "localhost",
            val port: Int = 9092)
}
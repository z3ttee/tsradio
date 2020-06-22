package live.tsradio.dataserver.files

import java.util.*

class PreferenceSections {

    class MySQLSettings(
            val apiVersion: Int = 1,
            val host: String = "localhost",
            val port: Int = 3306,
            val database: String = "dbname",
            val username: String = "user",
            val password: String = "pass",
            val prefix: String = "tsr_")
}
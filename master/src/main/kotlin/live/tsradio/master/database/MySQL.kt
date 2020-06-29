package live.tsradio.master.database

import live.tsradio.master.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet


object MySQL {
    private val logger: Logger = LoggerFactory.getLogger(MySQL::class.java)

    val tableNodes = "${Filesystem.preferences.mySQL.prefix}nodes"
    val tableChannels = "${Filesystem.preferences.mySQL.prefix}channels"
    val tablePlaylists = "${Filesystem.preferences.mySQL.prefix}playlists"
    val tableGenres = "${Filesystem.preferences.mySQL.prefix}genres"
    val tableSessions = "${Filesystem.preferences.mySQL.prefix}sessions"

    var connection: Connection? = null

    private fun connect() {
        try {
            connection = DriverManager.getConnection("jdbc:mysql://${Filesystem.preferences.mySQL.host}:${Filesystem.preferences.mySQL.port}/${Filesystem.preferences.mySQL.database}?autoReconnect=true&useUnicode=true&characterEncoding=utf8&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=CET", Filesystem.preferences.mySQL.username, Filesystem.preferences.mySQL.password)
            logger.info("Connected to mysql database '${Filesystem.preferences.mySQL.host}:${Filesystem.preferences.mySQL.port}/${Filesystem.preferences.mySQL.database}' successfully.")
        } catch (ex: Exception) {
            logger.error("Could not connect to mysql database: ${ex.message}")
            ex.printStackTrace()
        }
    }

    fun setup() {
        if(!hasConnection()) connect()

        if(hasConnection()) {
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableNodes`(id VARCHAR(36) NOT NULL UNIQUE, name VARCHAR(32) NOT NULL UNIQUE, lastLogin BIGINT NOT NULL);")
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableChannels`(id VARCHAR(36) NOT NULL UNIQUE, name VARCHAR(32) NOT NULL UNIQUE, nodeID VARCHAR(32) NOT NULL, description VARCHAR(256) DEFAULT 'no description', creatorID VARCHAR(32) DEFAULT 'System', mountpoint VARCHAR(32) NOT NULL, playlistID VARCHAR(32), playlistShuffle BOOLEAN NOT NULL DEFAULT TRUE, playlistLoop BOOLEAN NOT NULL DEFAULT TRUE, genres TEXT, featured BOOLEAN DEFAULT TRUE, listed BOOLEAN DEFAULT TRUE, priority INT DEFAULT 0);")
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableSessions`(id VARCHAR(36) NOT NULL UNIQUE, sessionHash VARCHAR(254) NOT NULL UNIQUE, expirationDate BIGINT DEFAULT -1);")
        }
    }

    private fun hasConnection(): Boolean {
        return this.connection != null && !this.connection!!.isClosed
    }

    fun get(table: String, whereClause: String, selection: ArrayList<String>, maxResults: Int = 1): ResultSet? {
        try {
            if (!hasConnection()) connect()

            val where: String = when (whereClause.isEmpty()) {
                true -> ""
                else -> " WHERE $whereClause"
            }

            val pps = when (maxResults) {
                0 -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table$where;")
                else -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table WHERE $whereClause LIMIT $maxResults;")
            }

            return pps.executeQuery()
        } catch (ex: Exception) {
            logger.error("An error occured when executing a database query: ${ex.message}")
            return null
        }
    }

    fun rawUpdate(sql: String): Int {
        return try {
            if (!hasConnection()) connect()

            connection!!.prepareStatement(sql).executeUpdate()
        } catch (ex: Exception) {
            logger.error("An error occured when executing a database update: ${ex.message}")
            0
        }
    }

    fun exists(table: String, whereClause: String): Boolean {
        return try {
            if(!hasConnection()) connect()

            val count = count(table, whereClause)
            count != 0
        } catch (ex: Exception) {
            logger.error("An error occured when executing a database query: ${ex.message}")
            return false
        }
    }

    fun count(table: String, whereClause: String): Int {
        return try {
            if(!hasConnection()) connect()

            val pps = connection!!.prepareStatement("SELECT COUNT(*) FROM `$table` WHERE $whereClause;")
            val result = pps.executeQuery()

            if (result.next()) {
                result.getInt(1)
            } else {
                0
            }
        } catch (ex: Exception) {
            logger.error("An error occured when executing a database query: ${ex.message}")
            0
        }
    }

}
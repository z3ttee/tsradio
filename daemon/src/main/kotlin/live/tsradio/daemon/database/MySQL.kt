package live.tsradio.daemon.database

import live.tsradio.daemon.exception.ExceptionHandler
import live.tsradio.daemon.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet

object MySQL {
    private val logger: Logger = LoggerFactory.getLogger(MySQL::class.java)
    private var connection: Connection? = null
    private const val requiredVersion = 1

    val tableNodes = "${Filesystem.preferences.mySQL.prefix}nodes"
    val tableChannels = "${Filesystem.preferences.mySQL.prefix}channels"
    val tablePlaylists = "${Filesystem.preferences.mySQL.prefix}playlists"
    val tableGenres = "${Filesystem.preferences.mySQL.prefix}genres"
    val tableInfo = "${Filesystem.preferences.mySQL.prefix}info"

    init {
        try {
            connect()
            onCreate()

            val currentVersion = Filesystem.preferences.mySQL.apiVersion
            if (currentVersion < requiredVersion) onUpgrade(currentVersion)
            if (currentVersion > requiredVersion) onDowngrade()
        } catch (ex: ExceptionInInitializerError) {
            ExceptionHandler(ex.exception).handle()
        } catch (ex: Exception){
            ExceptionHandler(ex).handle()
        }
    }

    private fun onCreate(){
        if(hasConnection()){
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableNodes`(id VARCHAR(32) NOT NULL UNIQUE, name VARCHAR(32) NOT NULL UNIQUE);")
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableChannels`(id VARCHAR(32) NOT NULL UNIQUE, name VARCHAR(32) NOT NULL UNIQUE, nodeID VARCHAR(32) NOT NULL, description VARCHAR(256) DEFAULT 'no description', creatorID VARCHAR(32) DEFAULT 'System', mountpoint VARCHAR(32) NOT NULL, playlistID VARCHAR(32), playlistShuffle BOOLEAN NOT NULL DEFAULT TRUE, playlistLoop BOOLEAN NOT NULL DEFAULT TRUE, genres TEXT);")
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tablePlaylists`(id VARCHAR(32) NOT NULL UNIQUE, name VARCHAR(32) NOT NULL UNIQUE, path VARCHAR(256) NOT NULL, creatorID VARCHAR(32) DEFAULT 'System', genres TEXT);")
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableGenres`(id VARCHAR(32) NOT NULL UNIQUE, name VARCHAR(32) NOT NULL UNIQUE);")
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableInfo`(id VARCHAR(32) NOT NULL UNIQUE, title VARCHAR(256) NOT NULL, artist VARCHAR(256) NOT NULL, history TEXT);")
        } else {
            logger.info("Could not process onCreate(): No connection to mysql database")
        }
    }
    private fun onUpgrade(oldVersion: Int){
        logger.info("Found old api ($oldVersion) for mysql connection. Upgrading database to ($requiredVersion)...")
        // Do upgrades here: Like altering table etc.
    }
    private fun onDowngrade(){}

    private fun connect(){
        logger.info("Connecting to mysql...")

        val additionalParams = "?useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC"
        connection = DriverManager.getConnection("jdbc:mysql://${Filesystem.preferences.mySQL.host}:${Filesystem.preferences.mySQL.port}/${Filesystem.preferences.mySQL.database}$additionalParams", Filesystem.preferences.mySQL.username, Filesystem.preferences.mySQL.password)
        logger.info("Connected to mysql")
    }
    fun hasConnection(): Boolean {
        return connection != null
    }
    private fun disconnect(){
        if(hasConnection()) {
            connection!!.close()
            connection = null
        }
    }

    fun exists(table: String, field: String, whereClause: String): Boolean {
        return count(table, field, whereClause) != 0
    }

    fun rawUpdate(sql: String): Int {
        return if(hasConnection()) {
            return connection!!.prepareStatement(sql).executeUpdate()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            0
        }
    }
    fun rawQuery(sql: String): ResultSet? {
        return if(hasConnection()) {
            return connection!!.prepareStatement(sql).executeQuery()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            null
        }
    }

    fun get(table: String, whereClause: String, selection: ArrayList<String>, maxResults: Int = 1): ResultSet? {
        return if(hasConnection()) {
            val pps = when(maxResults){
                0 -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table WHERE $whereClause;")
                else -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table WHERE $whereClause LIMIT $maxResults;")
            }
            pps.executeQuery()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            null
        }
    }

    fun count(table: String, field: String, whereClause: String): Int {
        return if(hasConnection()) {
            val pps = connection!!.prepareStatement("SELECT COUNT($field) AS `amount` FROM `$table` WHERE $whereClause;")

            pps.executeQuery().getInt("amount")
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            0
        }
    }

    fun insert(table: String, fields: ContentValues): Boolean {
        return if(hasConnection()) {
            var keys = ""
            var values = ""

            for((index, entry) in fields.entries.withIndex()) {
                if(index == 0){
                    keys = entry.key
                    values = "'${entry.value}'"
                } else {
                    keys += ",${entry.key}"
                    values += ",'${entry.value}'"
                }
            }

            logger.info("INSERT INTO `$table`($keys) VALUES ($values);")
            val pps = connection!!.prepareStatement("INSERT INTO `$table`($keys) VALUES ($values);")

            pps.execute()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            false
        }
    }

    fun update(table: String, whereClause: String, fields: ContentValues): Int {
        return if(hasConnection()) {
            var joined = ""

            for((index, entry) in fields.entries.withIndex()) {
                logger.info("$index:$entry")
                if(index == 0){
                    joined = "${entry.key}=${entry.value}"
                } else {
                    joined += ",${entry.key}=${entry.value}"
                }
            }

            val pps = connection!!.prepareStatement("UPDATE `$table` SET $joined WHERE $whereClause;")
            pps.executeUpdate()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            0
        }
    }

    fun delete(table: String, whereClause: String): Boolean? {
        return if(hasConnection()) {

            val pps = connection!!.prepareStatement("DELETE FROM `$table` WHERE $whereClause;")
            pps.execute()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            false
        }
    }

}
package live.tsradio.dataserver.database

import com.mysql.cj.jdbc.exceptions.CommunicationsException
import live.tsradio.dataserver.files.Filesystem
import live.tsradio.dataserver.exception.ExceptionHandler
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
    val tableSessions = "${Filesystem.preferences.mySQL.prefix}sessions"

    init {
        try {
            connect()
            onCreate()

        } catch (ex: ExceptionInInitializerError) {
            ExceptionHandler(ex.exception).handle()
        } catch (ex: Exception){
            ExceptionHandler(ex).handle()
        }
    }

    private fun onCreate(){
        if(hasConnection()){
            rawUpdate("CREATE TABLE IF NOT EXISTS `$tableSessions`(id VARCHAR(32) NOT NULL UNIQUE, sessionHash VARCHAR(254) NOT NULL UNIQUE, expirationDate BIGINT DEFAULT -1);")
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

        val additionalParams = "?autoReconnect=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC"
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

    fun exists(table: String, whereClause: String): Boolean {
        return try {
            val count = count(table, whereClause)
            count != 0
        } catch (ex: CommunicationsException) {
            connect()
            exists(table, whereClause)
        }
    }

    fun rawUpdate(sql: String): Int {
        return if(hasConnection()) {
            connection!!.prepareStatement(sql).executeUpdate()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            0
        }
    }
    fun rawQuery(sql: String): ResultSet? {
        return if(hasConnection()) {
            connection!!.prepareStatement(sql).executeQuery()
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            null
        }
    }

    fun get(table: String, whereClause: String, selection: ArrayList<String>, maxResults: Int = 1): ResultSet? {
        return if(hasConnection()) {
            val where: String = when(whereClause.isEmpty()){
                true -> ""
                else -> " WHERE $whereClause"
            }
            val pps = when(maxResults){
                0 -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table$where;")
                else -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table WHERE $whereClause LIMIT $maxResults;")
            }

            val result = pps.executeQuery()
            if(result.next()) {
                result
            } else {
                null
            }
        } else {
            logger.error("Could not execute mysql query: No connection to mysql database.")
            null
        }
    }

    fun count(table: String, whereClause: String): Int {
        return if(hasConnection()) {
            val pps = connection!!.prepareStatement("SELECT COUNT(*) FROM `$table` WHERE $whereClause;")

            val result = pps.executeQuery()
            if(result.next()) {
                result.getInt(1)
            } else {
                0
            }

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
                if(index == 0){
                    joined = "${entry.key} = '${entry.value}'"
                } else {
                    joined += ",${entry.key} = '${entry.value}'"
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
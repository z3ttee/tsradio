package live.tsradio.nodeserver.utils

import live.tsradio.nodeserver.exception.ExceptionHandler
import live.tsradio.nodeserver.files.Filesystem
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

    init {
        try {
            connect()
        } catch (ex: ExceptionInInitializerError) {
            ExceptionHandler(ex.exception).handle()
        } catch (ex: Exception){
            ExceptionHandler(ex).handle()
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
        val count = count(table, whereClause)
        return count != 0
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
            val where: String = when(whereClause.isEmpty()){
                true -> ""
                else -> " WHERE $whereClause"
            }
            val pps = when(maxResults){
                0 -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table$where;")
                else -> connection!!.prepareStatement("SELECT ${selection.joinToString(",")} FROM $table WHERE $whereClause LIMIT $maxResults;")
            }
            pps.executeQuery()
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

    /*fun insert(table: String, fields: ContentValues): Boolean {
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
                // logger.info("$index:$entry")
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
    }*/

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
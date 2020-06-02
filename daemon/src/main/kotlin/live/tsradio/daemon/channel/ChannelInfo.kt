package live.tsradio.daemon.channel

import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParseException
import com.google.gson.JsonParser
import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.database.MySQL
import live.tsradio.daemon.sound.AudioTrack
import live.tsradio.daemon.utils.JsonEscaper
import live.tsradio.daemon.utils.SQLEscaper
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.collections.HashMap

const val MAX_HISTORY_SIZE = 8

data class ChannelInfo(
        val channel: Channel,
        var currentTrack: AudioTrack,
        private var history: HashMap<Long, AudioTrack> = HashMap(MAX_HISTORY_SIZE)
) {

    private val logger: Logger = LoggerFactory.getLogger(ChannelInfo::class.java)

    fun addToHistory(audioTrack: AudioTrack){
        val sortedHistory = sortedHistory()
        if(history.size >= MAX_HISTORY_SIZE){
            history.remove(sortedHistory.firstKey())
        }

        history[System.currentTimeMillis()] = audioTrack
    }

    fun clearTrack(){
        currentTrack = AudioTrack("null", "null", null, null)
    }
    fun update(){
        Thread(Runnable {
            if(channel.channelInfo.currentTrack.title == "null") {
                // Remove info from db
                MySQL.delete(MySQL.tableInfo, "id = '${channel.channelID}'")
            } else {
                // Update info
                if(MySQL.exists(MySQL.tableInfo, "id = '${channel.channelID}'")) {
                    MySQL.update(MySQL.tableInfo, "id = '${channel.channelID}'", toContentValues())
                } else {
                    MySQL.insert(MySQL.tableInfo, toContentValues())
                }

            }
        }).start()
    }

    fun toContentValues(): ContentValues {
        val values = ContentValues()
        values["id"] = channel.channelID.replace("-", "")
        values["title"] = SQLEscaper.escape(JsonEscaper.escape(currentTrack.title))
        values["artist"] = SQLEscaper.escape(JsonEscaper.escape(currentTrack.artist))

        val sortedHistory = sortedHistory()


        var historyJson = "["

        for(entry in sortedHistory) {
            val separator = when(sortedHistory.keys.indexOf(entry.key)){
                0 -> ""
                else -> ","
            }
            val title = JsonEscaper.escape(entry.value.title)
            val artist = JsonEscaper.escape(entry.value.artist)
            historyJson += "$separator{\"${System.currentTimeMillis()}\": {\"title\": \"$title\", \"artist\": \"$artist\"}}"
        }

        historyJson += "]"
        historyJson = JsonEscaper.escape(historyJson)

        values["history"] = SQLEscaper.escape(historyJson)

        /*logger.info(historyJson)
        logger.info(values["title"])
        logger.info(values["artist"])*/

        return values
    }

    private fun sortedHistory(): SortedMap<Long, AudioTrack> {
        return history.toSortedMap()
    }

    fun toChannelInfoPOJO(): ChannelInfoPOJO {
        return ChannelInfoPOJO(channel, currentTrack, history)
    }

    class ChannelInfoPOJO {

        var channel: Channel? = null
        var currentTrack: AudioTrack? = null
        private var history: HashMap<Long, AudioTrack> = HashMap(MAX_HISTORY_SIZE)

        constructor()
        constructor(channel: Channel, currentTrack: AudioTrack, history: HashMap<Long, AudioTrack>) {
            this.channel = channel
            this.currentTrack = currentTrack
            this.history = history
        }

        fun toChannelInfo(): ChannelInfo {
            return ChannelInfo(channel!!, currentTrack!!, history)
        }
    }
}
package live.tsradio.daemon.channel

import live.tsradio.daemon.database.ContentValues
import live.tsradio.daemon.database.MySQL
import live.tsradio.daemon.sound.AudioTrack
import java.util.*
import kotlin.collections.HashMap

const val MAX_HISTORY_SIZE = 8

data class ChannelInfo(
        val channel: Channel,
        var currentTrack: AudioTrack,
        private var history: HashMap<Long, AudioTrack> = HashMap(MAX_HISTORY_SIZE)
) {
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
                if(MySQL.exists(MySQL.tableInfo, "id", "id = '${channel.channelID}'")) {
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
        values["title"] = Regex.escape(currentTrack.title)
        values["artist"] = Regex.escape(currentTrack.artist)

        val sortedHistory = sortedHistory()
        var historyJson = "["

        for(entry in sortedHistory) {
            val separator = when(sortedHistory.keys.indexOf(entry.key)){
                0 -> ""
                else -> ","
            }
            historyJson += "$separator{\"date\": {\"title\": \"${entry.value.title}\", \"artist\": \"${entry.value.artist}\"}}"
        }

        historyJson += "]"

        values["history"] = historyJson
        return values
    }

    private fun sortedHistory(): SortedMap<Long, AudioTrack> {
        return history.toSortedMap()
    }
}
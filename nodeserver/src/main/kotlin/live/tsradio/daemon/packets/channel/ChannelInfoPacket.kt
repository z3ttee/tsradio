package live.tsradio.daemon.packets.channel

import live.tsradio.daemon.SocketClient
import live.tsradio.daemon.packets.Packet
import live.tsradio.daemon.sound.AudioTrack
import java.util.*
import kotlin.collections.HashMap

data class ChannelInfoPacket(
        val id: String,
        var title: String? = null,
        var artist: String? = null,
        var history: HashMap<Long, HashMap<String, String>> = HashMap()
): Packet("onChannelInfoUpdate") {

    fun clearAll(){
        title = null
        artist = null
        history.clear()
    }

    fun addToHistory(track: AudioTrack) {
        val sortedHistory = sortedHistory()

        if(history.size >= 8){
            history.remove(sortedHistory.firstKey())
        }

        val map = HashMap<String, String>()
        map["title"] = track.title
        map["artist"] = track.artist

        history[System.currentTimeMillis()] = map
    }

    fun triggerUpdate() {
        SocketClient.sendPacket(this)
    }

    private fun sortedHistory(): SortedMap<Long, HashMap<String, String>> {
        return history.toSortedMap()
    }
}
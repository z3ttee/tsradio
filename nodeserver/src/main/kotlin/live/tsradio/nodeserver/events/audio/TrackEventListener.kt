package live.tsradio.nodeserver.events.audio

import live.tsradio.nodeserver.api.audio.AudioTrack
import live.tsradio.nodeserver.api.node.channel.NodeChannel
import live.tsradio.nodeserver.api.node.channel.NodeChannelInfo
import live.tsradio.nodeserver.handler.ChannelHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.net.SocketException
import java.util.*
import kotlin.collections.HashMap

object TrackEventListener {
    private val logger: Logger = LoggerFactory.getLogger(ChannelHandler::class.java)

    const val REASON_MAY_START_NEXT = 0
    const val REASON_EXCEPTION = 1

    fun onTrackStart(channel: NodeChannel, track: AudioTrack) {
        if(channel.info == null) {
            channel.info = NodeChannelInfo(
                    channel.id,
                    track.title,
                    track.artist,
                    HashMap())
        } else {
            channel.info!!.title = track.title
            channel.info!!.artist = track.artist
        }
        channel.info!!.sendUpdate()
    }

    fun onTrackEnd(channel: NodeChannel, track: AudioTrack, endReason: Int, exception: Exception?) {
        addToHistory(channel.info!!, track)

        if(endReason != REASON_MAY_START_NEXT || exception != null) {
            channel.info!!.clear()
            channel.info!!.sendUpdate()
        }

        if(exception != null){
            when (exception) {
                is SocketException -> {
                    logger.error("Connection closed: ${exception.message}")
                    throw exception
                }
                else -> exception.printStackTrace()
            }
        }
    }

    private fun addToHistory(channelInfo: NodeChannelInfo, track: AudioTrack) {
        val history = channelInfo.history
        val sortedHistory = sortedHistory(channelInfo.history)

        if(sortedHistory.size >= 8){
            history.remove(sortedHistory.firstKey())
        }

        val map = HashMap<String, String>()
        map["title"] = track.title
        map["artist"] = track.artist

        history[System.currentTimeMillis()] = map
        channelInfo.history = history
    }

    private fun sortedHistory(history: HashMap<Long, HashMap<String, String>>?): SortedMap<Long, HashMap<String, String>> {
        if(history == null) return HashMap<Long, HashMap<String, String>>().toSortedMap()
        return history.toSortedMap()
    }

}
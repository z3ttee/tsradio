package live.tsradio.nodeserver.events.audio

import live.tsradio.nodeserver.sound.AudioTrack

const val REASON_MAY_START_NEXT = 0
const val REASON_EXCEPTION = 1

interface TrackEventListener {

    fun onTrackStart(track: AudioTrack)
    fun onTrackEnd(track: AudioTrack, endReason: Int, exception: Exception?)

}
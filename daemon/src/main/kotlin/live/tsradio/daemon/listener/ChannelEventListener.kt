package live.tsradio.daemon.listener

import live.tsradio.daemon.channel.Channel

const val REASON_SHUTDOWN_TRIGGERED = 0
const val REASON_CHANNEL_EXCEPTION: Int = 1

interface ChannelEventListener {

    fun onChannelReady(channel: Channel)
    fun onChannelDone(channel: Channel)
    fun onChannelStop(channel: Channel, reason: Int = REASON_SHUTDOWN_TRIGGERED)

}
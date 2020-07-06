package live.tsradio.nodeserver.events.channel

import com.google.gson.Gson
import io.socket.emitter.Emitter
import live.tsradio.nodeserver.api.node.channel.NodeChannel
import live.tsradio.nodeserver.channel.Channel
import live.tsradio.nodeserver.files.Filesystem
import live.tsradio.nodeserver.handler.ChannelHandler

class OnNodeChannelUpdate: Emitter.Listener {

    override fun call(vararg args: Any?) {
        val packet = Gson().fromJson(Gson().toJsonTree(args).asJsonArray[0].asString, NodeChannel::class.java)

        val channel = Channel(packet)
        ChannelHandler.set(channel)

        if(Filesystem.preferences.channels.autostart) {
            ChannelHandler.startChannel(channel.data.id)
        }
    }
}
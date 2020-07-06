package live.tsradio.nodeserver.api.node.channel

import com.google.gson.Gson
import com.google.gson.annotations.Expose
import com.mpatric.mp3agic.Mp3File
import live.tsradio.nodeserver.events.audio.IcecastConnectionListener
import live.tsradio.nodeserver.events.channel.ChannelEventListener
import live.tsradio.nodeserver.exception.StreamException
import live.tsradio.nodeserver.files.Filesystem
import live.tsradio.nodeserver.handler.ChannelHandler
import live.tsradio.nodeserver.icecast.IcecastClient
import live.tsradio.nodeserver.packets.Packet
import live.tsradio.nodeserver.api.audio.AudioTrack
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileNotFoundException
import java.net.ConnectException
import java.net.SocketException
import java.util.*
import java.util.concurrent.ExecutorService
import kotlin.collections.ArrayList

data class NodeChannel(
        @Expose val id: UUID,
        @Expose val name: String,
        @Expose val description: String,
        @Expose val nodeID: UUID,
        @Expose val creatorID: UUID,
        @Expose val mountpoint: String,
        @Expose val shuffled: Boolean,
        @Expose val looped: Boolean,
        @Expose val genres: ArrayList<UUID>,
        @Expose val featured: Boolean,
        @Expose val listed: Boolean,
        @Expose val priority: Int,
        @Expose var info: NodeChannelInfo?,
        @Expose var playlist: NodeChannelPlaylist?
): Packet() {

    override fun toListenerSafeJSON(): String {
        val jsonObject = Gson().toJsonTree(this).asJsonObject
        jsonObject.remove("nodeID")
        jsonObject.remove("shuffled")
        jsonObject.remove("looped")
        jsonObject.remove("listed")
        return jsonObject.toString()
    }
}
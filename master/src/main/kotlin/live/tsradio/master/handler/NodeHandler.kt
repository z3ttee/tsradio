package live.tsradio.master.handler

import com.google.gson.Gson
import live.tsradio.master.SocketServer
import live.tsradio.master.api.node.channel.NodeChannel
import live.tsradio.master.api.node.NodeServer
import live.tsradio.master.api.node.NodeStatus
import live.tsradio.master.api.node.channel.NodeChannelPlaylist
import live.tsradio.master.events.Events
import live.tsradio.master.utils.MySQL
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

object NodeHandler {
    private val logger: Logger = LoggerFactory.getLogger(NodeHandler::class.java)

    val nodeServers = HashMap<UUID, NodeServer>()
    val channels = HashMap<UUID, NodeChannel>()

    fun getChannelsOfNode(nodeID: UUID): ArrayList<NodeChannel> {
        return this.channels.values.filter { it.nodeID == nodeID }.toCollection(ArrayList())
    }
    fun getListedChannels(): ArrayList<NodeChannel> {
        return this.channels.values.filter { it.listed }.toCollection(ArrayList())
    }

    fun loginNode(nodeID: UUID) {
        if(MySQL.exists(MySQL.tableNodes, "id = '$nodeID'")){
            val map = HashMap<String, String>()
            map["lastLogin"] = System.currentTimeMillis().toString()
            MySQL.update(MySQL.tableNodes, "id = '$nodeID'", map)
            this.loadNode(nodeID)
        }
    }

    private fun loadNode(nodeID: UUID) {
        if(!MySQL.exists(MySQL.tableNodes, "id = '${nodeID}'")) {
            logger.warn("Could not find node server in database for id '${nodeID}'")
            return
        }

        val resultset = MySQL.get(MySQL.tableNodes, "id = '${nodeID}'", ArrayList())
        if(resultset == null || !resultset.next()) {
            logger.warn("Could not find node server in database for id '${nodeID}'")
            return
        }

        val nodeData = NodeServer(
                UUID.fromString(resultset.getString("id")),
                resultset.getString("name"),
                resultset.getLong("lastLogin"),
                NodeStatus.NODE_STATUS_STARTING
        )
        this.nodeServers[nodeData.id] = nodeData

        val channelsResult = MySQL.get(MySQL.tableChannels, "nodeID = '${nodeData.id}'", ArrayList(listOf("id")))
        if(channelsResult != null && channelsResult.next()) {
            // Load all channels for node + send to corresponding node
            do {
                val id = UUID.fromString(channelsResult.getString("id"))
                val channel = loadChannel(id)

                if(channel != null) {
                    this.channels[id] = channel
                    ClientHandler.getNode(nodeData.id)?.client?.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, channel.toJSON())

                    ClientHandler.getListenerClients().forEach { it.client.sendEvent(Events.EVENT_NODE_CHANNEL_UPDATE, channel.toListenerSafeJSON()) }
                }
            } while (channelsResult.next())
        }
    }

    fun unloadNode(nodeID: UUID) {
        if(this.nodeServers.containsKey(nodeID)) {
            this.nodeServers.remove(nodeID)
        }
        this.channels.values.forEach {
            if(it.nodeID == nodeID) this.channels.remove(it.id)
        }
    }

    fun loadChannel(uuid: UUID): NodeChannel? {
        val chanResult = MySQL.get(MySQL.tableChannels, "id = '$uuid'")

        if(chanResult == null || !chanResult.next()) {
            return null
        }

        val playlistID = chanResult.getString("playlistID")
        val channelPlaylist: NodeChannelPlaylist? = loadPlaylist(playlistID)

        return NodeChannel(
                UUID.fromString(chanResult.getString("id")),
                chanResult.getString("name"),
                chanResult.getString("description"),
                UUID.fromString(chanResult.getString("nodeID")),
                UUID.fromString(chanResult.getString("creatorID")),
                chanResult.getString("mountpoint"),
                chanResult.getBoolean("shuffled"),
                chanResult.getBoolean("looped"),
                Gson().fromJson(chanResult.getString("genres"), ArrayList<UUID>()::class.java),
                chanResult.getBoolean("featured"),
                chanResult.getBoolean("listed"),
                chanResult.getInt("priority"),
                null,
                channelPlaylist,
                false
        )
    }

    fun loadPlaylist(playlistID: String?): NodeChannelPlaylist? {
        if(playlistID != null && !playlistID.equals("null", true)) {
            // Load playlist data
            val playlistResult = MySQL.get(MySQL.tablePlaylists, "id = '$playlistID'")
            if(playlistResult != null && playlistResult.next()) {
                return NodeChannelPlaylist(
                        UUID.fromString(playlistResult.getString("id")),
                        playlistResult.getString("name"),
                        UUID.fromString(playlistResult.getString("creatorID")),
                        Gson().fromJson(playlistResult.getString("genres"), ArrayList<UUID>()::class.java))
            }
        }

        return null
    }
}
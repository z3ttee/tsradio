package live.tsradio.master.handler

import com.google.gson.Gson
import live.tsradio.master.api.node.channel.NodeChannel
import live.tsradio.master.api.node.NodeServer
import live.tsradio.master.api.node.NodeStatus
import live.tsradio.master.api.node.channel.NodeChannelPlaylist
import live.tsradio.master.database.MySQL
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

    fun loadNode(nodeID: UUID) {
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

        val channelsResult = MySQL.get(MySQL.tableChannels, "nodeID = '${nodeData.id}'")
        if(channelsResult != null && channelsResult.next()) {
            // Load all channels for node + send to corresponding node
            do {
                val channelData = NodeChannel(
                        UUID.fromString(channelsResult.getString("id")),
                        channelsResult.getString("name"),
                        channelsResult.getString("description"),
                        UUID.fromString(channelsResult.getString("nodeID")),
                        UUID.fromString(channelsResult.getString("creatorID")),
                        channelsResult.getString("mountpoint"),
                        channelsResult.getBoolean("shuffled"),
                        channelsResult.getBoolean("looped"),
                        Gson().fromJson(channelsResult.getString("genres"), ArrayList<UUID>()::class.java),
                        channelsResult.getBoolean("featured"),
                        channelsResult.getBoolean("listed"),
                        channelsResult.getInt("priority"),
                        null,
                        null,
                        false
                )
                val playlistID = channelsResult.getString("playlistID")
                if(playlistID != "null") {
                    val playlistResult = MySQL.get(MySQL.tablePlaylists, "id = '$playlistID'")
                    if(playlistResult != null && playlistResult.next()) {
                        val playlistData = NodeChannelPlaylist(
                                UUID.fromString(playlistResult.getString("id")),
                                playlistResult.getString("name"),
                                UUID.fromString(playlistResult.getString("creatorID")),
                                Gson().fromJson(channelsResult.getString("genres"), ArrayList<UUID>()::class.java)
                        )
                        channelData.playlist = playlistData
                    }
                }

                this.channels[channelData.id] = channelData
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
}
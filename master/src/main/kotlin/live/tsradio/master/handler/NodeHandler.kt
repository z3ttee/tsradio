package live.tsradio.master.handler

import live.tsradio.master.api.node.NodeChannel
import live.tsradio.master.api.node.NodeServer
import live.tsradio.master.api.node.NodeStatus
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
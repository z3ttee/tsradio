package live.tsradio.master.events.node

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import com.google.gson.Gson
import live.tsradio.master.api.client.NodeClient
import live.tsradio.master.api.node.NodeStatus
import live.tsradio.master.handler.ClientHandler
import live.tsradio.master.handler.NodeHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class OnNodeStatusChangeEvent: DataListener<String> {
    private val logger: Logger = LoggerFactory.getLogger(OnNodeStatusChangeEvent::class.java)

    override fun onData(client: SocketIOClient?, data: String?, ackSender: AckRequest?) {
        if(client != null && data != null) {
            val clientData = ClientHandler.getClient(client.sessionId)

            if(clientData !is NodeClient) {
               return
            }

            val nodestatus = Gson().fromJson(data, NodeStatus::class.java)
            val nodeserver = NodeHandler.nodeServers[nodestatus.id]!!

            nodeserver.nodeStatus = nodestatus.status
            NodeHandler.nodeServers[nodestatus.id] = nodeserver

            logger.info("Node '${nodeserver.name}' changed status to '${when(nodestatus.status){
                NodeStatus.NODE_STATUS_STARTING -> "STARTING"
                NodeStatus.NODE_STATUS_OFFLINE -> "OFFLINE"
                NodeStatus.NODE_STATUS_ONLINE -> "ONLINE"
                else -> "UNDEFINED"
            }}'")
        }
    }
}
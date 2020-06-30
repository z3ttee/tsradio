package live.tsradio.master.handler

import live.tsradio.master.api.node.NodeChannel
import live.tsradio.master.api.node.NodeServer
import java.util.*
import kotlin.collections.HashMap

object NodeHandler {
    val nodeServers = HashMap<UUID, NodeServer>()

    val activeChannels = HashMap<UUID, NodeChannel>()
    val configuredChannels = HashMap<UUID, NodeChannel>()
}
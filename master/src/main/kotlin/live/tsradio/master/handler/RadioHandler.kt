package live.tsradio.master.handler

import live.tsradio.master.api.node.NodeChannel
import java.util.*
import kotlin.collections.HashMap

object RadioHandler {
    val channels = HashMap<UUID, NodeChannel>()
}
package live.tsradio.master.packets

import com.google.gson.annotations.Expose
import live.tsradio.master.api.NodeServer

class NodeDataPacket(
    @Expose val node: NodeServer
): Packet()
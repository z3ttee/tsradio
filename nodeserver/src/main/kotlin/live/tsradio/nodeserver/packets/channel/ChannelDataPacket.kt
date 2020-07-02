package live.tsradio.nodeserver.packets.channel

import live.tsradio.nodeserver.packets.Packet

data class ChannelDataPacket(
        var id: String,
        var nodeID: String,
        var name: String,
        var description: String,
        var creatorID: String,
        var mountpoint: String,
        var playlistID: String,
        var genres: ArrayList<String>,
        var featured: Boolean,
        var listed: Boolean,
        var shuffled: Boolean,
        var looped: Boolean,
        var priority: Int,
        var info: ChannelInfoPacket = ChannelInfoPacket(id)
): Packet() {
    override fun toListenerSafeJSON(): String {
        TODO("Not yet implemented")
    }
}
package live.tsradio.dataserver.api.channel

import live.tsradio.dataserver.objects.ChannelInfo

data class ChannelDataUpdate(
        val id: String,
        val name: String,
        val description: String,
        val creatorID: String,
        val mountpoint: String,
        val genres: ArrayList<String>,
        val featured: Boolean,
        val priority: Int,
        val info: ChannelInfo
)
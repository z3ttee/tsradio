package live.tsradio.dataserver.objects

data class ChannelInfo(
        val title: String,
        val artist: String,
        var history: HashMap<Long, HashMap<String, String>>?
)
package live.tsradio.master.api.node

import com.google.gson.annotations.Expose
import java.util.*
import kotlin.collections.HashMap

data class NodeChannelInfo(
        val id: UUID,
        @Expose val title: String,
        @Expose val artist: String,
        @Expose val history: HashMap<Long, HashMap<String, String>>
)
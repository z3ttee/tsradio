package live.tsradio.master.api.node

import com.google.gson.annotations.Expose
import java.util.*
import kotlin.collections.ArrayList

data class NodeChannel(
        @Expose val id: UUID,
        @Expose val name: String,
        @Expose val description: String,
        @Expose val nodeID: UUID,
        @Expose val creatorID: UUID,
        @Expose val mountpoint: String,
        @Expose val playlistID: UUID,
        @Expose val shuffled: Boolean,
        @Expose val looped: Boolean,
        @Expose val genres: ArrayList<UUID>,
        @Expose val featured: Boolean,
        @Expose val listed: Boolean,
        @Expose val priority: Int,
        @Expose val info: NodeChannelInfo
)
package live.tsradio.master.api

import com.google.gson.annotations.Expose
import java.util.*

data class NodeServer(
    @Expose val id: UUID,
    @Expose val name: String,
    @Expose val lastLogin: Long
)
package live.tsradio.dataserver.api

import java.util.*

data class MovingClient(
        val uuid: UUID,
        val from: UUID?,
        val to: UUID?
)
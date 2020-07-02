package live.tsradio.nodeserver.api.error

import live.tsradio.nodeserver.packets.Packet

data class ServerError(
        val errorCode: Int,
        val message: String
): Packet() {
    override fun toListenerSafeJSON(): String {
        return "{}"
    }

    companion object {
        const val ERROR_WRONG_AUTH_CREDENTIALS = 0
    }
}
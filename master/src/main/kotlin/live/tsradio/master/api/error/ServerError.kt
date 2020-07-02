package live.tsradio.master.api.error

import live.tsradio.master.packets.Packet

data class ServerError(
        val errorCode: Int,
        val message: String
): Packet() {
    override fun toListenerSafeJSON(): String {
        return "{}"
    }

    companion object {
        const val ERROR_WRONG_AUTH_CREDENTIALS = 0
        const val ERROR_ACTION_BLOCKED = 1
    }
}
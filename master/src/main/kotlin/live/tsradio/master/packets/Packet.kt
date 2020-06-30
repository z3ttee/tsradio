package live.tsradio.master.packets

import com.google.gson.Gson

abstract class Packet {

    abstract fun toListenerSafeJSON(): String
    fun toJSON(): String {
        return Gson().toJson(this)
    }

}
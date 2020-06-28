package live.tsradio.master.packets

import com.google.gson.GsonBuilder

class Packet(
    val eventName: String
) {

    fun toJSON(): String {
        return GsonBuilder().excludeFieldsWithoutExposeAnnotation().create().toJson(this)
    }

}
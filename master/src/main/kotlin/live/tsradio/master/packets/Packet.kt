package live.tsradio.master.packets

import com.google.gson.GsonBuilder

abstract class Packet {

    fun toJSON(): String {
        return GsonBuilder().excludeFieldsWithoutExposeAnnotation().create().toJson(this)
    }

}
package eu.tsalliance.streamer.socket.packets;

import com.google.gson.Gson;

public abstract class Packet {

    public String write() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }

}

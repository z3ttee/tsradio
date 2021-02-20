package eu.tsalliance.streamer.socket.packets;

import com.google.gson.Gson;
import lombok.Getter;

public class PacketOutInfoChange extends Packet {

    @Getter private String uuid;
    @Getter private String title;
    @Getter private String artist;

    public PacketOutInfoChange(String uuid, String title, String artist) {
        this.uuid = uuid;
        this.title = title;
        this.artist = artist;
    }
}

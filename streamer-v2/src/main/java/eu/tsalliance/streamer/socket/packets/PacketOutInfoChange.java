package eu.tsalliance.streamer.socket.packets;

import lombok.Getter;

public class PacketOutInfoChange extends Packet {

    @Getter private String uuid;
    @Getter private String title;
    @Getter private String artist;
    @Getter private long timestamp;

    public PacketOutInfoChange(String uuid, String title, String artist, long timestamp) {
        this.uuid = uuid;
        this.title = title;
        this.artist = artist;
        this.timestamp = timestamp;
    }
}

package eu.tsalliance.streamer.socket.packets;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.Expose;
import eu.tsalliance.streamer.channel.AudioTrack;
import lombok.Getter;

import java.util.List;

public class PacketOutHistoryChange extends Packet {

    @Expose @Getter private String uuid;
    @Expose @Getter private final List<AudioTrack> tracks;

    public PacketOutHistoryChange(String uuid, List<AudioTrack> tracks) {
        this.uuid = uuid;
        this.tracks = tracks;
    }

    @Override
    public String write() {
        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        return gson.toJson(this);
    }
}

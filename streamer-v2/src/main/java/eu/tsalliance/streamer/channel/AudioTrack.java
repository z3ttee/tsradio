package eu.tsalliance.streamer.channel;

import com.google.gson.annotations.Expose;
import com.mpatric.mp3agic.Mp3File;
import lombok.Getter;
import lombok.Setter;

import java.io.File;

public class AudioTrack {

    @Expose @Getter private String title;
    @Expose @Getter private String artist;
    @Expose @Getter @Setter private long timestamp;

    @Getter private final File file;
    @Getter private final Mp3File mp3Data;

    public AudioTrack(String title, String artist, File file, Mp3File mp3Data) {
        this.title = title;
        this.artist = artist;
        this.file = file;
        this.mp3Data = mp3Data;
    }
}

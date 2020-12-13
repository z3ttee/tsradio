package live.tsradio.streamer.objects;

import com.mpatric.mp3agic.Mp3File;
import lombok.Getter;

import java.io.File;

public class AudioTrack {

    @Getter private final String title;
    @Getter private final String artist;
    @Getter private final File file;
    @Getter private final Mp3File mp3Data;

    public AudioTrack(String title, String artist, File file, Mp3File mp3Data) {
        this.title = title;
        this.artist = artist;
        this.file = file;
        this.mp3Data = mp3Data;
    }

}

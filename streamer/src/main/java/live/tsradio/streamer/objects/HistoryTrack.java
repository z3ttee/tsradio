package live.tsradio.streamer.objects;

import lombok.Getter;

public class HistoryTrack {

    @Getter private final long timestamp;
    @Getter private final String title;
    @Getter private final String artist;

    public HistoryTrack(String title, String artist) {
        this.timestamp = System.currentTimeMillis();
        this.title = title;
        this.artist = artist;
    }
}

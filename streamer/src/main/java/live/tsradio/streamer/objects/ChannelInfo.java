package live.tsradio.streamer.objects;

import live.tsradio.streamer.utils.JsonEscaper;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

public class ChannelInfo {

    @Getter @Setter private String title;
    @Getter @Setter private String artist;
    @Getter @Setter private AudioTrack.AlbumArtwork artwork;
    @Getter @Setter private ArrayList<HistoryTrack> history;

    public ChannelInfo() {
        this.clear();
    }

    public void clear() {
        this.title = "null";
        this.artist = "null";
        this.artwork = null;
        this.history = new ArrayList<>();
    }

    public void addToHistory(AudioTrack track) {
        if(history.size() == 8) {
            history.remove(0);
        }

        history.add(new HistoryTrack(JsonEscaper.getInstance().escape(track.getTitle()), JsonEscaper.getInstance().escape(track.getArtist())));
    }
}

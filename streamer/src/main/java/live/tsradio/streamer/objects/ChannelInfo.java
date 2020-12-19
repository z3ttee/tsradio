package live.tsradio.streamer.objects;

import live.tsradio.streamer.files.FileHandler;
import live.tsradio.streamer.utils.JsonEscaper;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.ArrayList;

public class ChannelInfo {
    private static final Logger logger = LoggerFactory.getLogger(ChannelInfo.class);

    private final String channelUUID;
    @Getter @Setter private String title;
    @Getter @Setter private String artist;
    @Getter @Setter private ArrayList<HistoryTrack> history;

    public ChannelInfo(String channelUUID) {
        this.channelUUID = channelUUID;
        this.clear();
    }

    public void clear() {
        this.title = "null";
        this.artist = "null";
        this.history = new ArrayList<>();
        this.clearArtworkHistory();
    }

    public void addToHistory(AudioTrack track) {
        if(history.size() == 8) {
            HistoryTrack historyTrack = history.remove(0);
            this.removeArtworkFromHistory(historyTrack);
        }

        HistoryTrack historyTrack = new HistoryTrack(JsonEscaper.getInstance().escape(track.getTitle()), JsonEscaper.getInstance().escape(track.getArtist()));
        history.add(historyTrack);
        this.moveArtworkToHistory(historyTrack);
    }

    private void removeArtworkFromHistory(HistoryTrack track) {
        File historyArtworkDir = new File(FileHandler.getInstance().getArtworksDir().getAbsolutePath()+"/"+this.channelUUID);
        File historyTrackArtwork = new File(historyArtworkDir.getAbsolutePath(), track.getTimestamp()+".png");

        if(historyTrackArtwork.exists()) {
            try {
                FileUtils.forceDelete(historyTrackArtwork);
            } catch (Exception ex) {
                logger.error("removeArtworkFromHistory(): Could not delete file "+historyTrackArtwork.getAbsolutePath()+": "+ex.getMessage());
            }
        }
    }
    private void moveArtworkToHistory(HistoryTrack track) {
        File artwork = new File(FileHandler.getInstance().getArtworksDir().getAbsolutePath(), this.channelUUID + ".png");
        File historyArtworkDir = new File(FileHandler.getInstance().getArtworksDir().getAbsolutePath()+"/"+this.channelUUID);
        File historyTrackArtwork = new File(historyArtworkDir.getAbsolutePath(), track.getTimestamp()+".png");

        if(!historyArtworkDir.exists() && !historyArtworkDir.mkdirs()) {
            logger.warn("addToHistory(): Could not create directory "+historyArtworkDir.getAbsolutePath());
            return;
        }

        try {
            FileUtils.moveFile(artwork, historyTrackArtwork);
        } catch (Exception ex) {
            logger.error("addToHistory(): Exception occured: "+ex.getMessage());
        }
    }

    private void clearArtworkHistory() {
        File historyArtworkDir = new File(FileHandler.getInstance().getArtworksDir().getAbsolutePath()+"/"+this.channelUUID);

        try {
            if(historyArtworkDir.exists()) {
                FileUtils.cleanDirectory(historyArtworkDir);
            }
        } catch (Exception ex) {
            logger.error("clearArtworkHistory(): Could not clear directory "+historyArtworkDir.getAbsolutePath()+": "+ex.getMessage());
        }
    }
}

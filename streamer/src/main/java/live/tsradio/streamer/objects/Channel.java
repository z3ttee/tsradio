package live.tsradio.streamer.objects;

import lombok.Getter;

public class Channel {

    @Getter private String uuid;
    @Getter private String playlistUUID;
    @Getter private boolean isEnabled;

    public Channel(String uuid, String playlistUUID, boolean isEnabled) {
        this.uuid = uuid;
        this.playlistUUID = playlistUUID;
        this.isEnabled = isEnabled;
    }
}

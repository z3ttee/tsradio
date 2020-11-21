package live.tsradio.streamer.database;

import lombok.Getter;

public enum RedisChannels {

    CHANNEL_UPDATE_METADATA("channel_update_metadata"),
    CHANNEL_STATUS_UPDATE("channel_update_status"),
    CHANNEL_DELETE("channel_delete");

    @Getter private final String channelName;
    RedisChannels(String channelName){
        this.channelName = channelName;
    }

}

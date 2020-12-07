package live.tsradio.streamer.database.consts;

import lombok.Getter;

public enum RedisChannels {

    CHANNEL_UPDATE_METADATA("channel_update_metadata"),
    CHANNEL_STATUS_UPDATE("channel_update_status"),
    CHANNEL_DELETE("channel_deleted"),
    CHANNEL_CREATE("channel_created");

    @Getter private final String channelName;
    RedisChannels(String channelName){
        this.channelName = channelName;
    }

}

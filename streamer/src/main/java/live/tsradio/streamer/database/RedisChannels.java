package live.tsradio.streamer.database;

import lombok.Getter;

public enum RedisChannels {

    UPDATE_METADATA("channel_update_metadata"),
    TEST("test");

    @Getter private final String channelName;
    RedisChannels(String channelName){
        this.channelName = channelName;
    }

}

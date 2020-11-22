package live.tsradio.streamer.database.consts;

import lombok.Getter;

public enum RedisSets {

    SET_ACTIVE_CHANNELS("set_active_channels"),
    SET_CHANNEL_INFOS("set_channel_infos");

    @Getter
    private final String setName;
    RedisSets(String setName){
        this.setName = setName;
    }

}

package live.tsradio.streamer.database.consts;

import lombok.Getter;

public enum RedisLists {

    SET_ACTIVE_CHANNELS("set_active_channels");

    @Getter
    private final String listName;
    RedisLists(String listName){
        this.listName = listName;
    }

}

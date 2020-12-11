package live.tsradio.streamer.database.consts;

import lombok.Getter;

public enum RedisLists {

    MAP_CHANNEL_STATUS("map_channel_status"),
    MAP_CHANNEL_METADATA("map_channel_metadata"),
    MAP_CHANNEL_HISTORY("map_channel_history");

    @Getter
    private final String listName;
    RedisLists(String listName){
        this.listName = listName;
    }

}

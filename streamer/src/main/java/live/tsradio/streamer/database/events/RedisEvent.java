package live.tsradio.streamer.database.events;

public interface RedisEvent {

    void onEvent(String channel, String message);

}

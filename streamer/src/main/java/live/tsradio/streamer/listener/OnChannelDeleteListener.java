package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.events.RedisEvent;

public class OnChannelDeleteListener implements RedisEvent {
    @Override
    public void onEvent(String channel, String message) {

    }
}

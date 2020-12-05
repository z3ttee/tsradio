package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.events.RedisEvent;
import live.tsradio.streamer.handler.ChannelHandler;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OnChannelDeleteListener implements RedisEvent {
    private static final Logger logger = LoggerFactory.getLogger(OnChannelDeleteListener.class);

    @Override
    public void onEvent(String channel, String message) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject json = (JSONObject) parser.parse(message);

            String channelUUID = (String) json.get("uuid");
            ChannelHandler.removeChannel(channelUUID);
        } catch (Exception e) {
           logger.warn("onEvent(): Could not properly handle event received by redis["+channel+"]: "+e.getMessage());
        }
    }
}

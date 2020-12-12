package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.events.RedisEvent;
import live.tsradio.streamer.handler.ChannelHandler;
import live.tsradio.streamer.objects.Channel;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OnChannelSkipListener implements RedisEvent {
    private static final Logger logger = LoggerFactory.getLogger(OnChannelSkipListener.class);

    @Override
    public void onEvent(String channel, String message) {
        try {
            logger.info("onEvent(): "+message);

            JSONParser parser = new JSONParser();
            JSONObject json = (JSONObject) parser.parse(message);

            String channelUUID = (String) json.get("uuid");
            Channel c = ChannelHandler.getChannel(channelUUID);

            if(c != null) {
                logger.info("onEvent(): triggering skip...");
                c.next();
            }
        } catch (Exception e) {
            logger.warn("onEvent(): Could not properly handle event received by redis["+channel+"]: "+e.getMessage());
        }
    }
}

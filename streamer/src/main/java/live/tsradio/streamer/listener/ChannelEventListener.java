package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.RedisChannels;
import live.tsradio.streamer.objects.Channel;

public class ChannelEventListener {

    public static void onChannelStarted(Channel channel) {
        String jsonData = "{ \"uuid\": \""+channel.getUuid()+"\", \"active\": \"true\"}";
        Redis.getInstance().publish(RedisChannels.CHANNEL_STATUS_UPDATE, jsonData);
        channel.logger.info("onChannelStarted(): Channel started.");
    }

    public static void onChannelStopped(Channel channel) {
        String jsonData = "{ \"uuid\": \""+channel.getUuid()+"\", \"active\": \"false\"}";
        Redis.getInstance().publish(RedisChannels.CHANNEL_STATUS_UPDATE, jsonData);
        channel.logger.info("onChannelStopped(): Channel stopped.");
    }

}

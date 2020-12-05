package live.tsradio.streamer.listener;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.consts.RedisChannels;
import live.tsradio.streamer.database.consts.RedisLists;
import live.tsradio.streamer.handler.ChannelHandler;
import live.tsradio.streamer.objects.Channel;

public class ChannelEventListener {

    public static void onChannelStarted(Channel channel) {
        channel.setActive(true);
        String data = channel.toJSON();

        Redis.getInstance().setInMap(RedisLists.SET_ACTIVE_CHANNELS, channel.getUuid(), data);
        Redis.getInstance().publish(RedisChannels.CHANNEL_STATUS_UPDATE, data);

        channel.logger.info("onChannelStarted(): Channel started.");
    }

    public static void onChannelStopped(Channel channel) {
        channel.setActive(false);
        String data = channel.toJSON();

        Redis.getInstance().removeFromMap(RedisLists.SET_ACTIVE_CHANNELS, channel.getUuid());
        Redis.getInstance().publish(RedisChannels.CHANNEL_STATUS_UPDATE, data);

        ChannelHandler.unloadChannel(channel);
        channel.logger.info("onChannelStopped(): Channel stopped.");
    }

}

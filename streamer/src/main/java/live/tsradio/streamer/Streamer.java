package live.tsradio.streamer;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.consts.RedisChannels;
import live.tsradio.streamer.handler.ChannelHandler;
import live.tsradio.streamer.listener.OnChannelCreateListener;
import live.tsradio.streamer.listener.OnChannelDeleteListener;
import live.tsradio.streamer.listener.OnChannelSkipListener;
import live.tsradio.streamer.listener.OnChannelUpdateListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Streamer {
    private static final Logger logger = LoggerFactory.getLogger(Streamer.class);

    public static void main(String[] args) throws InterruptedException {
        logger.info("main(): Starting Streamer...");

        // Load channels from database
        ChannelHandler.loadChannels();
        ChannelHandler.startChannels();

        // Register channels to listen to changes from redis
        Redis.getInstance().on(RedisChannels.CHANNEL_DELETE, new OnChannelDeleteListener());
        Redis.getInstance().on(RedisChannels.CHANNEL_CREATE, new OnChannelCreateListener());
        Redis.getInstance().on(RedisChannels.CHANNEL_UPDATE, new OnChannelUpdateListener());
        Redis.getInstance().on(RedisChannels.CHANNEL_SKIP, new OnChannelSkipListener());

        // Prevent main thread from shutting down whole application
        Thread.currentThread().join();
    }

}

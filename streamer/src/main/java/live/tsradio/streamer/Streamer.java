package live.tsradio.streamer;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.database.RedisChannels;
import live.tsradio.streamer.handler.ChannelHandler;
import live.tsradio.streamer.listener.OnChannelDeleteListener;
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

        // Prevent main thread from shutting down whole application
        Thread.currentThread().join();
    }

}

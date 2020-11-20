package live.tsradio.streamer;

import live.tsradio.streamer.handler.ChannelHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Streamer {
    private static final Logger logger = LoggerFactory.getLogger(Streamer.class);

    public static void main(String[] args) throws InterruptedException {
        logger.info("main(): Starting Streamer...");

        ChannelHandler.loadChannels();

        // Prevent main thread from shutting down whole application
        Thread.currentThread().join();
    }

}

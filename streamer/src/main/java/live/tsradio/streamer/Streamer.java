package live.tsradio.streamer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Streamer {
    private static final Logger logger = LoggerFactory.getLogger(Streamer.class);

    public static void main(String[] args) throws InterruptedException {
        logger.info("main(): Starting Streamer...");

        // Prevent main thread from shutting down whole application
        Thread.currentThread().join();
    }

}

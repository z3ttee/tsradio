package eu.tsalliance.streamer;

import eu.tsalliance.streamer.channel.ChannelHandler;
import eu.tsalliance.streamer.console.CommandHandler;
import eu.tsalliance.streamer.console.ConsoleHandler;
import eu.tsalliance.streamer.files.FileHandler;
import eu.tsalliance.streamer.socket.SocketClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Core {
    private static final Logger logger = LoggerFactory.getLogger(Core.class);

    public static void main(String[] args) throws Exception {
        logger.info("main(): Starting streamer...");

        // Start command system
        ConsoleHandler.newInstance().start();
        CommandHandler.registerCommands();
        SocketClient.getInstance();

        ChannelHandler.loadChannels();

        // Prevent main thread from shutting down whole application
        Thread.currentThread().join();
    }

    public static void restart(){
        logger.info("Restarting streamer...");

        // Restart Console handler
        FileHandler.getInstance().loadConfig();
        CommandHandler.registerCommands();

        SocketClient.restart();

        logger.info("Streamer successfully restarted!");
    }

}

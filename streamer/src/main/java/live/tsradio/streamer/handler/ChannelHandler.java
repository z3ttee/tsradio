package live.tsradio.streamer.handler;

import live.tsradio.streamer.objects.Channel;
import live.tsradio.streamer.repositories.ChannelRepository;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;

public class ChannelHandler {
    private static final Logger logger = LoggerFactory.getLogger(ChannelHandler.class);

    @Getter private static ArrayList<Channel> channels = new ArrayList<>();

    public static void loadChannels() {
        logger.info("loadChannels(): Loading channels from database...");

        ChannelRepository repository = new ChannelRepository();
        channels = repository.findAll();

        logger.info("loadChannels(): Registered "+channels.size()+" channel(s).");
    }
    public static void startChannels() {
        logger.info("startChannels(): Starting all channels...");
        for(Channel channel : channels) {
            channel.boot();
        }
    }

}

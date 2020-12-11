package live.tsradio.streamer.handler;

import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.files.FileHandler;
import live.tsradio.streamer.objects.Channel;
import live.tsradio.streamer.repositories.ChannelRepository;
import lombok.Getter;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.HashMap;

public class ChannelHandler {
    private static final Logger logger = LoggerFactory.getLogger(ChannelHandler.class);

    @Getter private static HashMap<String, Channel> channels = new HashMap<>();

    public static void loadChannels() {
        logger.info("loadChannels(): Loading channels from database...");

        ChannelRepository repository = new ChannelRepository();
        channels = repository.findAll();

        logger.info("loadChannels(): Registered "+channels.size()+" channel(s).");
    }
    public static void startChannels() {
        if(channels.size() > 0) {
            logger.info("startChannels(): Starting all channels...");
            for (Channel channel : channels.values()) {
                channel.boot();
            }
        } else {
            logger.warn("startChannels(): Can not start any channel: Nothing found.");
        }
    }
    public static void unloadChannel(String channelUUID) {
        channels.remove(channelUUID);
    }

    public static Channel getChannel(String channelUUID) {
        return channels.get(channelUUID);
    }

    @SuppressWarnings("ResultOfMethodCallIgnored")
    public static void removeChannel(String channelUUID) throws Exception {
        Channel channel = getChannel(channelUUID);

        if(channel != null) {
            // Wait for channel to shutdown
            logger.info("removeChannel(): Shutting down channel and prepare for deletion...");
            channel.shutdown();
            channel.join();
            logger.info("removeChannel(): Done.");

            File renamedDir = new File(FileHandler.getInstance().getRootDirectory().getAbsolutePath()+"/playlists/deletedChannel-"+channelUUID);
            File channelDir = new File(FileHandler.getInstance().getChannelsRootDirectory().getAbsolutePath()+"/"+channel.getPath().replace("/", "")+"-"+channelUUID);

            channelDir.setWritable(true);
            renamedDir.setWritable(true);
            renamedDir.setReadable(true);

            Thread.sleep(1000);

            if(channelDir.renameTo(renamedDir)) {
                logger.info("removeChannel(): Channel folder disabled: '"+channelDir.getAbsolutePath()+"'");
            } else {
                logger.warn("removeChannel(): Could not disable channel folder '"+channelDir.getAbsolutePath()+"'");
            }

            channels.remove(channelUUID);
        }
    }
    public static void registerChannel(String channelUUID) {
        ChannelRepository repository = new ChannelRepository();
        Channel channel = repository.findOneByID(channelUUID);

        if(channel != null) {
            channels.put(channelUUID, channel);
            logger.info("registerChannel(): Registered new channel '"+channel.getTitle()+"'");
            channel.boot();
        }
    }
    public static void updateOrRegisterChannel(String channelUUID, JSONObject jsonData) {
        Channel channel = getChannel(channelUUID);

        if(channel == null) {
            registerChannel(channelUUID);
            return;
        }

        if(!(boolean) jsonData.get("enabled")) {
            channel.shutdown();
            unloadChannel(channelUUID);
            return;
        }

        channel.setTitle((String) jsonData.get("title"));
        channel.setDescription((String) jsonData.get("description"));
        channel.setFeatured((boolean) jsonData.get("featured"));

        logger.info("updateOrRegisterChannel(): Updated channel "+getChannel(channelUUID).getTitle());
    }

}

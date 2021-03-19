package eu.tsalliance.streamer.commands;

import eu.tsalliance.streamer.channel.Channel;
import eu.tsalliance.streamer.channel.ChannelHandler;
import eu.tsalliance.streamer.channel.ChannelState;
import eu.tsalliance.streamer.console.Command;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CmdChannel extends Command {
    private static final Logger logger = LoggerFactory.getLogger(CmdChannel.class);

    public CmdChannel() {
        super("channel", "<list | start | stop | restart>", "Channel command", new ArrayList<>(Collections.singletonList("ch")));
    }

    @Override
    public void execute(String name, ArrayList<String> args) {
        if(args.size() <= 0) {
            logger.info("channel - Main channel command");
            logger.info("channel list - List all loaded channels");
            logger.info("channel start - Start a channel");
            logger.info("channel stop - Stop a channel");
            logger.info("channel restart <uuid> - Restart a channel");
        } else {
            if (args.get(0).equalsIgnoreCase("list")) {
                Map<ChannelState, List<Channel>> stateSortedChannels = ChannelHandler.getChannels().values().stream().collect(Collectors.groupingBy(Channel::getChannelState));

                if(stateSortedChannels.isEmpty()) {
                    logger.info("No channels registered");
                    return;
                }

                for (List<Channel> channelList : stateSortedChannels.values()) {
                    for (Channel channel : channelList) {
                        logger.info(channel.getChannelState().getName().toUpperCase() + " | " + channel.getMountpoint() + " | " + channel.getUuid());
                    }
                }

                return;
            }

            if (args.get(0).equalsIgnoreCase("start")) {
                if(args.size() < 2) {
                    this.sendUsage();
                    return;
                }

                String channelId = args.get(1);
                try {
                    ChannelHandler.startChannel(channelId);
                } catch (Exception ex) {
                    logger.warn("An error occured when manually starting a channel: " + ex.getMessage());
                }
                return;
            }

            if (args.get(0).equalsIgnoreCase("stop")) {
                if(args.size() < 2) {
                    this.sendUsage();
                    return;
                }

                String channelId = args.get(1);
                try {
                    ChannelHandler.stopChannel(channelId);
                } catch (Exception ex) {
                    logger.warn("An error occured when manually stopping a channel: " + ex.getMessage());
                }
                return;
            }

            if (args.get(0).equalsIgnoreCase("restart")) {
                if(args.size() < 2) {
                    this.sendUsage();
                    return;
                }

                String channelId = args.get(1);
                try {
                    ChannelHandler.restartChannel(channelId);
                } catch (Exception ex) {
                    logger.warn("An error occured when manually restarting a channel: " + ex.getMessage());
                }
                return;
            }

            if (args.get(0).equalsIgnoreCase("skip")) {
                if(args.size() < 2) {
                    this.sendUsage();
                    return;
                }

                String channelId = args.get(1);
                if(!ChannelHandler.channelExists(channelId)) {
                    logger.info("This channel does not exist");
                    return;
                }

                if(!ChannelHandler.isRunning(channelId)) {
                    logger.info("This channel does not play any music");
                    return;
                }

                ChannelHandler.getChannel(channelId).skip();
                logger.info("Skipped current track");
            }
        }

    }
}

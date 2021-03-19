package eu.tsalliance.streamer.channel;

import eu.tsalliance.streamer.database.MySQL;
import eu.tsalliance.streamer.files.FileHandler;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.ResultSet;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ChannelHandler {
    private static final Logger logger = LoggerFactory.getLogger(ChannelHandler.class);
    @Getter private static HashMap<String, Channel> channels = new HashMap<>();
    @Getter private static ExecutorService executorService = Executors.newCachedThreadPool();

    /**
     * Load all channels from database and register them in hashmap
     */
    public static void loadChannels() {
        try {
            if (channels.size() > 0) {
                for (String channelId : channels.keySet()) {
                    stopChannel(channelId);
                }
            }

            channels.clear();

            ResultSet rs = MySQL.query("SELECT uuid, mountpoint, enabled FROM " + MySQL.TABLE_CHANNELS + " WHERE enabled = 1;");
            if (rs != null) {
                do {
                    String uuid = rs.getString("uuid");
                    String mountpoint = rs.getString("mountpoint");
                    boolean enabled = rs.getBoolean("enabled");

                    Channel channel = new Channel(uuid, mountpoint, enabled);
                    registerChannel(channel);
                } while (rs.next());

                logger.info("loadChannels(): Loaded '" + channels.size() + "' channels");
            } else {
                logger.warn("loadChannels(): Could not find channels...");
            }
        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }

    /**
     * Unload a channel
     * @param uuid Channel's uuid
     */
    public static void unloadChannel(String uuid) {
        if(!channelExists(uuid)) {
            return;
        }

        channels.remove(uuid);
        System.gc();
    }

    /**
     * Register a new channel
     * @param channel Channel to register
     */
    public static void registerChannel(Channel channel) {
        if(channelExists(channel.getUuid())) {
            return;
        }

        channels.put(channel.getUuid(), channel);

        if(channel.isEnabled()) {
            startChannel(channel.getUuid());
        }
    }

    /**
     * Get a channel by its uuid
     * @param uuid Channel's uuid
     * @return Channel or null
     */
    public static Channel getChannel(String uuid) {
        return channels.getOrDefault(uuid, null);
    }

    /**
     * Check if a channel is loaded
     * @param uuid Channel's uuid
     * @return True or False
     */
    public static boolean channelExists(String uuid) {
        return channels.containsKey(uuid);
    }

    /**
     * Get the state of a channel
     * @param uuid Channel's uuid
     * @return ChannelState or null
     */
    public static ChannelState getState(String uuid) {
        if(!channelExists(uuid)) {
            return null;
        }

        return getChannel(uuid).getChannelState();
    }

    /**
     * Check if the Channel's state is not STATE_OFFLINE
     * @param uuid Channel's uuid
     * @return True or False
     */
    public static boolean isRunning(String uuid) {
        return getState(uuid) != ChannelState.STATE_OFFLINE;
    }

    /**
     * Start a channel
     * @param uuid Channel's uuid
     */
    public static void startChannel(String uuid) {
        if(!channelExists(uuid)) {
            logger.warn("startChannels(): Could not start channel by id '" + uuid + "': Channel not found");
            return;
        }

        if(isRunning(uuid)) {
            logger.warn("startChannels(): Could not start channel by id '" + uuid + "': Channel already running");
            return;
        }

        executorService.execute(getChannel(uuid));
    }

    /**
     * Stop a channel
     * @param uuid Channel's uuid
     */
    public static void stopChannel(String uuid) {
        if(!channelExists(uuid)) {
            logger.warn("restartChannel(): Could not restart channel '" + uuid + "': Channel not found");
            return;
        }

        if(!isRunning(uuid)) {
            startChannel(uuid);
            return;
        }

        Channel channel = channels.get(uuid);

        try {
            channel.shutdown();
            while(isRunning(uuid)) {
                Thread.sleep(1000);
            }
            Thread.sleep(500);
        } catch (Exception ex) {
            logger.error("restartChannel(): An error occured when stopping a channel: " + ex.getMessage());
        }
    }

    /**
     * Restart a channel
     * @param uuid Channel's uuid
     */
    public static void restartChannel(String uuid) {
        if(!channelExists(uuid)) {
            logger.warn("restartChannel(): Could not restart channel '" + uuid + "': Channel not found");
            return;
        }

        if(!isRunning(uuid)) {
            startChannel(uuid);
            return;
        }

        try {
            stopChannel(uuid);
            startChannel(uuid);
        } catch (Exception ex) {
            ex.printStackTrace();
            logger.error("restartChannel(): An error occured when restarting a channel: " + ex.getMessage());
        }
    }

    /**
     * Delete a channel locally
     * @param uuid Channel to delete
     */
    public static void deleteChannel(String uuid) {
        if(!channelExists(uuid)) {
            return;
        }

        Channel channel = getChannel(uuid);

        // Shutdown channel if running
        if(isRunning(uuid)) {
            stopChannel(uuid);
        }

        unloadChannel(uuid);
        FileHandler.deleteChannelDirectory(channel);
    }

    /**
     * Update a specific channel
     * @param uuid Uuid of target
     * @param updatedChannel Updated data
     */
    public static void updateChannel(String uuid, Channel updatedChannel) {
        if(!channelExists(uuid)) {
            return;
        }

        Channel oldChannel = getChannel(uuid);

        // Only update locally, if mountpoint has changed
        if(!oldChannel.getMountpoint().equals(updatedChannel.getMountpoint())) {
            if(isRunning(uuid)) {
                stopChannel(uuid);
            }

            unloadChannel(uuid);

            FileHandler.renameChannelDirectory(oldChannel, updatedChannel);
            logger.info("updateChannel(): Updated channel '" + oldChannel.getMountpoint() + "' >> "+updatedChannel.getMountpoint() + " - Enabled: "+updatedChannel.isEnabled());

            if(updatedChannel.isEnabled()) {
                channels.put(uuid, updatedChannel);
                startChannel(uuid);
            }
        }

    }

    /**
     * Send channel state updates to socket server
     */
    public static void notifyAllChannelStates() {
        for(Channel channel : channels.values()) {
            channel.notifyChannelStateChange();
        }
    }

    /**
     * Send channel state updates to socket server
     */
    public static void notifyAllChannelInfos() {
        for(Channel channel : channels.values()) {
            channel.notifyChannelInfoChange();
        }
    }

    /**
     * Send channel state updates to socket server
     */
    public static void notifyAllChannelHistories() {
        for(Channel channel : channels.values()) {
            channel.notifyChannelHistoryChange();
        }
    }
}

package eu.tsalliance.streamer.channel;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import eu.tsalliance.streamer.files.FileHandler;
import eu.tsalliance.streamer.icecast.IcecastClient;
import eu.tsalliance.streamer.listener.TrackEventListener;
import eu.tsalliance.streamer.socket.SocketClient;
import eu.tsalliance.streamer.socket.SocketEvents;
import eu.tsalliance.streamer.socket.packets.PacketOutHistoryChange;
import eu.tsalliance.streamer.socket.packets.PacketOutInfoChange;
import eu.tsalliance.streamer.socket.packets.PacketOutStateChange;
import lombok.Getter;
import lombok.Setter;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Channel implements Runnable, TrackEventListener {
    private static final Logger logger = LoggerFactory.getLogger(Channel.class);

    @Getter private final String uuid;
    @Getter @Setter private String mountpoint;
    @Getter @Setter private boolean enabled;
    @Getter private ChannelState channelState;

    @Getter @Setter private AudioTrack currentlyPlaying;
    @Getter @Setter private ArrayList<AudioTrack> history = new ArrayList<>();

    @Getter private final LinkedBlockingQueue<AudioTrack> queue = new LinkedBlockingQueue<>();
    @Getter private final ArrayList<AudioTrack> playlist = new ArrayList<>();

    @Getter private boolean shutdown = false;
    @Getter @Setter private boolean skippingCurrentTrack = false;
    @Getter private IcecastClient connection;

    public Channel(@NotNull String uuid, String mountpoint, boolean enabled) {
        this.uuid = uuid;
        this.mountpoint = mountpoint;
        this.enabled = enabled;
        this.channelState = ChannelState.STATE_OFFLINE;
    }

    @Override
    public void run() {
        FileHandler.clearAllArtworks(this);
        this.setChannelState(ChannelState.STATE_RUNNING);
        this.shutdown = false;

        logger.info("Channel '" + getMountpoint() + "' started.");

        while(!shutdown) {
            this.reload();

            this.connection = new IcecastClient(this);
            this.connection.connect();

            // If Client is connected to icecast -> Start streaming
            if(this.connection.isConnected()) {
                this.setChannelState(ChannelState.STATE_STREAMING);

                while (!shutdown && this.queue.peek() != null) {
                    this.next();
                }
            }

            this.connection.disconnect();

            if(!shutdown) {
                this.triggerRestart();
            }
        }

        // If this line is reached -> channel was stopped
        this.setChannelState(ChannelState.STATE_OFFLINE);
        logger.info("Channel '" + getMountpoint() + "' stopped.");
    }

    private void triggerRestart() {
        new Thread(() -> {
            logger.info("Channel '" + this.mountpoint + "' stopped. Restarting in 30s");
            try {
                Thread.sleep(30000);
                ChannelHandler.restartChannel(this.uuid);
            } catch (InterruptedException ignored) { }
        }).start();
        this.shutdown();
    }

    /**
     * Play next track
     */
    public void next() {
        AudioTrack track = this.queue.poll();
        this.currentlyPlaying = track;
        this.connection.stream(track);
    }

    /**
     * Skip current track
     */
    public void skip() {
        this.skippingCurrentTrack = true;
    }

    /**
     * Reload channels playlist and move into queue, if queue is empty
     */
    public void reload() {
        this.loadTracks();

        if(this.queue.size() <= 0) {
            this.reloadQueue();
        }
    }

    /**
     * Move shuffled playlist into queue
     */
    public void reloadQueue() {
        ArrayList<AudioTrack> shuffledQueue = new ArrayList<>(this.playlist);
        Collections.shuffle(shuffledQueue);
        this.queue.addAll(shuffledQueue);
    }

    /**
     * Load tracks from the channels playlist
     */
    private void loadTracks(){
        this.playlist.clear();

        File channelDirectory = FileHandler.getDirOfChannel(this);

        if(!FileHandler.getInstance().getChannelsRootDirectory().exists() && !FileHandler.getInstance().getChannelsRootDirectory().mkdirs() || !channelDirectory.exists() && !channelDirectory.mkdirs()) {
            return;
        }

        File[] files = channelDirectory.listFiles();

        if(files == null) {
            return;
        }

        List<File> trackFiles = Stream.of(files).filter(file -> !file.isDirectory()).collect(Collectors.toList());
        for(File file : trackFiles) {
            String title = "Unknown title";
            String artist = "Unknown artist";

            try {
                Mp3File mp3File = new Mp3File(file);

                if(mp3File.hasId3v2Tag()) {
                    title = mp3File.getId3v2Tag().getTitle();
                    artist = mp3File.getId3v2Tag().getArtist();
                } else if(mp3File.hasId3v1Tag()) {
                    title = mp3File.getId3v1Tag().getTitle();
                    artist = mp3File.getId3v1Tag().getArtist();
                }

                long artwork = System.currentTimeMillis();
                FileHandler.extractArtwork(mp3File, this.uuid, artwork);

                AudioTrack track = new AudioTrack(title, artist, String.valueOf(artwork), file, mp3File);
                this.queue.add(track);
            } catch (IOException | UnsupportedTagException | InvalidDataException e) {
                e.printStackTrace();
                logger.error("loadTracks(): Could not load track '"+file.getAbsolutePath()+"'");
            }
        }
    }

    /**
     * Sets the state of the channel and notifies the socket server
     * @param state Channel's new state
     */
    private void setChannelState(ChannelState state) {
        this.channelState = state;
        this.notifyChannelStateChange();
    }

    /**
     * Send an update to the socket server with the channel's state as payload
     */
    public void notifyChannelStateChange() {
        SocketClient.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_STATE, new PacketOutStateChange(this.getUuid(), this.getChannelState()));
    }

    /**
     * Send an update to the socket server with the channel's info as payload
     */
    public void notifyChannelInfoChange() {
        SocketClient.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_INFO, new PacketOutInfoChange(this.getUuid(), this.getCurrentlyPlaying().getTitle(), this.getCurrentlyPlaying().getArtist()));
    }

    /**
     * Send an update to the socket server with the channel's history as payload
     */
    public void notifyChannelHistoryChange() {
        List<AudioTrack> history = this.history;
        Collections.reverse(history);

        SocketClient.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_HISTORY, new PacketOutHistoryChange(this.getUuid(), history));
    }

    /**
     * Trigger a shutdown. Channel shuts down, if nothing critical needs to be done anymore
     */
    public void shutdown() {
        this.shutdown = true;
    }

    @Override
    public void onTrackStarted(AudioTrack track) {
        this.currentlyPlaying = track;
        this.notifyChannelInfoChange();
    }

    @Override
    public void onTrackEnded(AudioTrack track, int reason) {
        // Add track to history
        this.addToHistory(track);

        if(reason == REASON_DONE) {
            this.reloadQueue();
        } else if(reason == REASON_MAY_START_NEXT) {
            // May start next
            if(this.queue.size() <= 1) {
                this.loadTracks();
            }
        }
    }

    @Override
    public void onTrackException(AudioTrack track, Exception exception) {
        logger.error("onTrackException(): An Exception occured when playing track '"+track.getFile().getAbsolutePath()+"'");
        logger.error("onTrackException(): "+exception.getMessage());
        this.triggerRestart();
    }

    /**
     * Add track to history and preserve maximum size of 8 elements in history
     * @param track AudioTrack to add
     */
    private void addToHistory(AudioTrack track) {
        if(history.size() >= 8) {
            history.remove(0);
        }

        track.setTimestamp(System.currentTimeMillis());
        this.history.add(track);
        FileHandler.moveArtworkToHistory(this.uuid, track.getTimestamp());
        this.notifyChannelHistoryChange();
    }
}

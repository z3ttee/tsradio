package eu.tsalliance.streamer.channel;

import com.mpatric.mp3agic.Mp3File;
import eu.tsalliance.streamer.files.ArtworkHandler;
import eu.tsalliance.streamer.files.FileHandler;
import eu.tsalliance.streamer.icecast.IcecastClient;
import eu.tsalliance.streamer.listener.TrackEventListener;
import eu.tsalliance.streamer.socket.SocketClient;
import eu.tsalliance.streamer.socket.SocketEvents;
import eu.tsalliance.streamer.socket.packets.PacketOutHistoryChange;
import eu.tsalliance.streamer.socket.packets.PacketOutInfoChange;
import eu.tsalliance.streamer.socket.packets.PacketOutStateChange;
import eu.tsalliance.streamer.utils.JsonEscaper;
import lombok.Getter;
import lombok.Setter;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Channel implements Runnable, TrackEventListener {
    private static final Logger logger = LoggerFactory.getLogger(Channel.class);

    @Getter private final String uuid;
    @Getter @Setter private String mountpoint;
    @Getter @Setter private boolean enabled;
    @Getter private ChannelState channelState;

    @Getter @Setter private AudioTrack currentlyPlaying;
    @Getter @Setter private TreeSet<AudioTrack> history = new TreeSet<>(((o1, o2) -> (int) (o1.getTimestamp() - o2.getTimestamp())));

    @Getter private ArrayList<AudioTrack> queue = new ArrayList<>();
    @Getter private final ArrayList<AudioTrack> playlist = new ArrayList<>();

    @Getter private boolean shutdown = false;
    @Getter @Setter private boolean skippingCurrentTrack = false;
    @Getter private IcecastClient connection;

    private final Random randomGenerator;

    public Channel(@NotNull String uuid, String mountpoint, boolean enabled) {
        this.uuid = uuid;
        this.mountpoint = mountpoint;
        this.enabled = enabled;
        this.channelState = ChannelState.STATE_OFFLINE;
        this.randomGenerator = new Random();
    }

    @Override
    public void run() {
        ArtworkHandler.clearAllArtworks(this.uuid);
        this.setChannelState(ChannelState.STATE_RUNNING);
        this.shutdown = false;

        logger.info("Channel '" + getMountpoint() + "' started.");

        while(!shutdown) {
            // Wait till some files are detected to be played
            while(hasEmptyPlaylist() && !shutdown) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ignored) {}
            }

            // Channel was shut down before playlist finished current run -> Load progress
            if(FileHandler.getInstance().hasCachedPlaylist(this.uuid)) {
                this.loadCachedProgress();
                logger.info("run(): Queue size after loading cache: " + this.queue.size());

                // If queue still empty -> Load directly from folder
                if(this.queue.size() <= 0) {
                    logger.info("run(): Queue still empty. Loading actual playlist...");
                    this.reload();
                }
            } else {
                this.reload();
            }

            this.connection = new IcecastClient(this);
            this.connection.connect();

            // If Client is connected to icecast -> Start streaming
            if(this.connection.isConnected()) {
                while (!shutdown && this.queue.size() > 0) {
                    this.setChannelState(ChannelState.STATE_STREAMING);
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

    public void loadCachedProgress() {
        ArrayList<String> paths = FileHandler.getInstance().loadPlaylistFilePathsFromCache(this.uuid);
        this.loadTracksFromPaths(paths);

        if(this.playlist.size() < 2) {
            this.loadTracks();
        }

        this.reloadQueue();
    }

    public void cacheProgress() {
        FileHandler.getInstance().savePlaylistToFile(this.uuid, this.queue);
    }

    public void triggerRestart() {
        new Thread(() -> {
            logger.info("Channel '" + this.mountpoint + "' stopped. Restarting in 10s");
            try {
                Thread.sleep(10000);
                ChannelHandler.restartChannel(this.uuid);
            } catch (InterruptedException ignored) { }
        }).start();
        this.shutdown();
    }

    /**
     * Play next track
     */
    public void next() {
        int rnd = this.randomGenerator.nextInt(this.queue.size());
        AudioTrack track = this.queue.remove(rnd);

        // Save the current progress
        this.cacheProgress();

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
        this.queue = new ArrayList<>(this.playlist);
        logger.info("reloadQueue(): Queue size after reload: " + this.queue.size());
        this.playlist.clear();
    }

    /**
     * Check if the playlist on drive is empty
     * @return True or False
     */
    private boolean hasEmptyPlaylist() {
        File channelDirectory = FileHandler.getDirOfChannel(this);

        if(!FileHandler.getInstance().getChannelsRootDirectory().exists() && !FileHandler.getInstance().getChannelsRootDirectory().mkdirs() || !channelDirectory.exists() && !channelDirectory.mkdirs()) {
            return true;
        }

        List<File> files = Arrays.stream(channelDirectory.listFiles()).filter(File::isFile).collect(Collectors.toList());
        return files.size() <= 0;
    }

    /**
     * Load tracks from the channels playlist
     */
    private void loadTracks(){
        if(hasEmptyPlaylist()) return;

        this.playlist.clear();
        setChannelState(ChannelState.STATE_PREPARING);

        File channelDirectory = FileHandler.getDirOfChannel(this);
        File[] files = channelDirectory.listFiles();

        if(files != null) {
            List<File> trackFiles = Stream.of(files).filter(file -> !file.isDirectory()).collect(Collectors.toList());
            this.loadTracksFromPaths(trackFiles);
        }
    }

    private void loadTracksFromPaths(List<File> paths) {
        logger.info("loadTracksFromPaths(): Loading files... " + paths.size());

        for(File file : paths) {
            String title = "Unknown title";
            String artist = "Unknown artist";

            try {
                Mp3File mp3File = new Mp3File(file);

                if(mp3File.hasId3v2Tag()) {
                    title = JsonEscaper.getInstance().escape(mp3File.getId3v2Tag().getTitle(), "Unknown title");
                    artist = JsonEscaper.getInstance().escape(mp3File.getId3v2Tag().getArtist(), "Unknown artist");
                } else if(mp3File.hasId3v1Tag()) {
                    title = JsonEscaper.getInstance().escape(mp3File.getId3v1Tag().getTitle(), "Unknown title");
                    artist = JsonEscaper.getInstance().escape(mp3File.getId3v1Tag().getArtist(), "Unknown artist");
                }

                AudioTrack track = new AudioTrack(title, artist, file, mp3File);
                this.playlist.add(track);
            } catch (Exception e) {
                e.printStackTrace();
                logger.error("loadTracks(): Could not load track '"+file.getAbsolutePath()+"'");
            }
        }

        logger.info("loadTracks(): Loaded " + this.playlist.size() + " tracks into channel " + this.mountpoint);
    }

    private void loadTracksFromPaths(ArrayList<String> paths) {
        List<File> files = paths.stream().map(File::new).collect(Collectors.toList());
        this.loadTracksFromPaths(files);
    }

    /**
     * Sets the state of the channel and notifies the socket server
     * @param state Channel's new state
     */
    private void setChannelState(ChannelState state) {
        if(this.channelState == state) return;

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
        if(this.getCurrentlyPlaying() != null) {
            SocketClient.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_INFO, new PacketOutInfoChange(this.getUuid(), this.getCurrentlyPlaying().getTitle(), this.getCurrentlyPlaying().getArtist(), this.getCurrentlyPlaying().getTimestamp()));
        }
    }

    /**
     * Send an update to the socket server with the channel's history as payload
     */
    public void notifyChannelHistoryChange() {
        List<AudioTrack> history = new ArrayList<>(this.history);
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

        track.setTimestamp(System.currentTimeMillis());
        ArtworkHandler.extractArtwork(track.getMp3Data(), this.uuid, track.getTimestamp());

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
        this.removeFirstFromHistory();

        long oldTimestamp = track.getTimestamp();
        track.setTimestamp(System.currentTimeMillis());
        this.history.add(track);

        ArtworkHandler.moveArtworkToHistory(this.uuid, oldTimestamp, track.getTimestamp());
        this.notifyChannelHistoryChange();
    }

    /**
     * Remove first added track from history
     */
    private void removeFirstFromHistory() {
        if(history.size() < 8) {
            return;
        }

        AudioTrack track = history.first();
        ArtworkHandler.deleteArtwork(this.uuid, track.getTimestamp());
        history.remove(track);
    }
}

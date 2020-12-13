package live.tsradio.streamer.objects;

import com.google.gson.Gson;
import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import live.tsradio.streamer.database.Redis;
import live.tsradio.streamer.files.FileHandler;
import live.tsradio.streamer.listener.ChannelEventListener;
import live.tsradio.streamer.protocol.IcecastConnection;
import live.tsradio.streamer.protocol.IcecastMount;
import live.tsradio.streamer.utils.JsonEscaper;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Channel extends Thread {
    public final Logger logger = LoggerFactory.getLogger(Channel.class);
    @SuppressWarnings("FieldCanBeLocal")
    private final int PING_INTERVAL = 1000;

    @Getter private final String uuid;
    @Getter @Setter private String title;
    @Getter private final String path;
    @Getter @Setter private String description;
    @Getter @Setter private boolean featured;
    @Getter private final ChannelInfo info;
    @Getter @Setter private boolean active;
    @Getter @Setter private boolean special;
    @Getter private long lastPingSent;

    @Getter private AudioTrack currentTrack;
    @Getter private IcecastConnection connection;

    @Getter private final LinkedBlockingQueue<AudioTrack> queue = new LinkedBlockingQueue<>();
    @Getter private final ArrayList<AudioTrack> tracks = new ArrayList<>();

    public boolean shutdown = false;

    public Channel(String uuid, String title, String path, String description, boolean featured, boolean special, ChannelInfo info) {
        super("channel-"+path);

        this.uuid = uuid;
        this.path = path;
        this.title = title;
        this.description = description;
        this.featured = featured;
        this.special = special;
        this.info = info;
        this.currentTrack = null;
        this.active = false;
        this.lastPingSent = System.currentTimeMillis();
    }

    public void boot() {
        this.start();
    }
    public void shutdown() {
        this.shutdown = true;
    }

    @SuppressWarnings("BusyWait")
    @Override
    public void run() {

        // Send a ping every 10s
        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                sendPing();
            }
        }, 0, PING_INTERVAL);

        while (!shutdown ) {
            logger.info("start(): Starting channel '"+this.title+"'...");
            this.reload();

            IcecastMount mountpoint = new IcecastMount(this.title, this.path);
            this.connection = new IcecastConnection(this, mountpoint);
            this.connection.connect();

            if(this.connection.isConnected()) {
                ChannelEventListener.onChannelStarted(this);

                while (!shutdown && this.queue.peek() != null) {
                    this.next();
                }
            }

            ChannelEventListener.onChannelStopped(this);
            if(!shutdown) {
                logger.info("run(): Restarting in 30s");
                try {
                    Thread.sleep(30000);
                } catch (InterruptedException ignored) {
                }
            }
        }

        ChannelEventListener.onChannelStopped(this);
    }

    public void next() {
        AudioTrack track = this.queue.poll();
        this.currentTrack = track;
        logger.info("next(): next song triggered");
        this.connection.stream(track);
    }

    public void reload() {
        this.loadTracks();
        this.queue.clear();
        ArrayList<AudioTrack> shuffledQueue = new ArrayList<>(this.tracks);
        Collections.shuffle(shuffledQueue);
        this.queue.addAll(shuffledQueue);
    }

    private void loadTracks(){
        this.tracks.clear();

        File channelDirectory = new File(FileHandler.getInstance().getChannelsRootDirectory().getAbsolutePath()+"/"+this.path.replace("/", "")+"-"+this.uuid);

        if(!FileHandler.getInstance().getChannelsRootDirectory().exists() && !FileHandler.getInstance().getChannelsRootDirectory().mkdirs() || !channelDirectory.exists() && !channelDirectory.mkdirs()) {
            logger.error("loadTracks(): Could not load tracks of channel '"+this.title+"': Directory not found.");
            return;
        }

        File[] files = channelDirectory.listFiles();

        if(files == null) {
            logger.error("loadTracks(): Could not load tracks of channel '"+this.title+"': Directory is empty.");
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

                AudioTrack track = new AudioTrack(title, artist, file, mp3File);
                this.tracks.add(track);
            } catch (IOException | UnsupportedTagException | InvalidDataException e) {
                e.printStackTrace();
                logger.error("loadTracks(): Could not load track '"+file.getAbsolutePath()+"'");
            }
        }

        logger.info("loadTracks(): Loaded "+this.tracks.size()+" tracks from channel '"+this.title+"'");
    }

    public void extractArtworkToApi(Mp3File mp3Data){
        File dir = FileHandler.getInstance().getArtworksDir();
        if(dir.exists()) {
            File artworkFile = new File(dir.getAbsolutePath(), getUuid() + ".png");

            try {
                if(artworkFile.exists()) FileUtils.forceDelete(artworkFile);
            } catch (IOException ignored) {}

            if (mp3Data.hasId3v2Tag()) {
                try {
                    String mimeType = mp3Data.getId3v2Tag().getAlbumImageMimeType();
                    byte[] bytes = mp3Data.getId3v2Tag().getAlbumImage();

                    if(bytes == null) {
                        logger.warn("extractArtworkToApi(): No bytes found.");
                        return;
                    }

                    if(mimeType != null) {
                        if (!mimeType.equalsIgnoreCase("image/jpeg") && !mimeType.equalsIgnoreCase("image/png")) {
                            logger.warn("extractArtworkToApi(): Unsupported mime type for artwork. Found: " + mimeType);
                            return;
                        }
                    }

                    FileUtils.writeByteArrayToFile(artworkFile, bytes);
                } catch (Exception ex) {
                    logger.error("extractArtworkToApi(): Could not extract artwork: " + ex.getMessage());

                }
            }
        }
    }

    public String getStatusAsJSON() {
        return "{" +
                "\"uuid\": \""+getUuid()+"\"," +
                "\"title\": \""+ JsonEscaper.getInstance().escape(getTitle()) +"\"," +
                "\"description\": \""+ JsonEscaper.getInstance().escape(getDescription()) +"\"," +
                "\"path\": \""+ JsonEscaper.getInstance().escape(getPath()) +"\"," +
                "\"featured\": "+ isFeatured() +"," +
                "\"special\": "+ isSpecial() +"," +
                "\"active\": "+isActive()+"" +
                "}";
    }
    public String getMetadataAsJSON() {
        return "{" +
                "\"uuid\": \""+getUuid()+"\"," +
                "\"title\": \""+ JsonEscaper.getInstance().escape(getInfo().getTitle()) +"\"," +
                "\"artist\": \""+JsonEscaper.getInstance().escape(getInfo().getArtist())+"\"" +
                "}";
    }
    public String getHistoryAsJSON() {
        return "{" +
                "\"uuid\": \""+getUuid()+"\"," +
                "\"history\": " + new Gson().toJson(getInfo().getHistory()) +
                "}";
    }

    public void sendPing() {
        this.lastPingSent = System.currentTimeMillis();
        Redis.getInstance().publish("channel_ping", "{\"uuid\": \""+this.uuid+"\", \"timestamp\": "+this.lastPingSent+"}");
    }
}

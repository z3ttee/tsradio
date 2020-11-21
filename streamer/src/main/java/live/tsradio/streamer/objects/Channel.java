package live.tsradio.streamer.objects;

import live.tsradio.streamer.listener.ChannelEventListener;
import live.tsradio.streamer.protocol.IcecastConnection;
import live.tsradio.streamer.protocol.IcecastMount;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.concurrent.LinkedBlockingQueue;

public class Channel extends Thread {
    public final Logger logger = LoggerFactory.getLogger(Channel.class);

    @Getter private final String uuid;
    @Getter private final String title;
    @Getter private final String path;
    @Getter private final Playlist playlist;

    @Getter private AudioTrack currentTrack;
    @Getter private IcecastConnection connection;

    @Getter private final ArrayList<AudioTrack> history = new ArrayList<>();
    @Getter private final LinkedBlockingQueue<AudioTrack> queue = new LinkedBlockingQueue<>();

    public boolean shutdown = false;

    public Channel(String uuid, String title, String path, Playlist playlist) {
        super("channel-"+title);

        this.uuid = uuid;
        this.path = path;
        this.playlist = playlist;
        this.title = title;
        this.currentTrack = null;
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
        while (!shutdown ) {
            logger.info("start(): Starting channel '"+this.title+"'...");
            this.reload();

            IcecastMount mountpoint = new IcecastMount(this.title, this.path);
            this.connection = new IcecastConnection(this, mountpoint);
            this.connection.connect();

            if(this.connection.isConnected()) {
                ChannelEventListener.onChannelStarted(this);

                while (this.queue.peek() != null) {
                    this.next();
                }
            }

            ChannelEventListener.onChannelStopped(this);
            logger.info("run(): Restarting in 30s");
            try {
                Thread.sleep(30000);
            } catch (InterruptedException ignored) { }
        }

        ChannelEventListener.onChannelStopped(this);
    }

    public void next() {
        AudioTrack track = this.queue.poll();
        this.currentTrack = track;

        this.connection.stream(track);
    }

    public void reload() {
        this.playlist.reload();
        this.queue.clear();
        ArrayList<AudioTrack> shuffledQueue = this.playlist.getTracks();
        Collections.shuffle(shuffledQueue);
        this.queue.addAll(shuffledQueue);
    }
}

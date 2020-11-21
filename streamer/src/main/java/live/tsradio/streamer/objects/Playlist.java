package live.tsradio.streamer.objects;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.UnsupportedTagException;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Playlist {
    private static final Logger logger = LoggerFactory.getLogger(Playlist.class);

    @Getter private final String uuid;
    @Getter private final String title;
    @Getter private final ArrayList<AudioTrack> tracks = new ArrayList<>();

    public Playlist(String uuid, String title) {
        this.uuid = uuid;
        this.title = title;

        this.loadTracks();
    }

    public void reload() {
        this.loadTracks();
    }

    private void loadTracks(){
        this.tracks.clear();

        File playlistsRootDirectory = new File(System.getProperty("user.dir")+"/playlists/");
        File playlistDirectory = new File(playlistsRootDirectory.getAbsolutePath()+"/"+this.uuid+"/");

        if(!playlistsRootDirectory.exists() && !playlistsRootDirectory.mkdirs() || !playlistDirectory.exists() && !playlistDirectory.mkdirs()) {
            logger.error("loadTracks(): Could not load tracks of playlist '"+this.title+"': Directory not found.");
            return;
        }

        File[] files = playlistDirectory.listFiles();

        if(files == null) {
            logger.error("loadTracks(): Could not load tracks of playlist '"+this.title+"': Directory is empty.");
            return;
        }

        List<File> trackFiles = Stream.of(files).filter(file -> !file.isDirectory()).collect(Collectors.toList());
        for(File file : trackFiles) {
            String title = "Unknown title";
            String artist = "Unknown artist";

            try {
                Mp3File mp3File = new Mp3File(file);

                if(mp3File.hasId3v1Tag()) {
                    title = mp3File.getId3v1Tag().getTitle();
                    artist = mp3File.getId3v1Tag().getArtist();
                }
                if(mp3File.hasId3v2Tag()) {
                    title = mp3File.getId3v2Tag().getTitle();
                    artist = mp3File.getId3v2Tag().getArtist();
                }

                AudioTrack track = new AudioTrack(title, artist, file, mp3File);
                this.tracks.add(track);
            } catch (IOException | UnsupportedTagException | InvalidDataException e) {
                e.printStackTrace();
                logger.error("loadTracks(): Could not load track '"+file.getAbsolutePath()+"'");
            }
        }

        logger.info("loadTracks(): Loaded "+this.tracks.size()+" tracks from playlist '"+this.title+"'");
    }
}

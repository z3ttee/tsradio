package eu.tsalliance.streamer.files;

import com.mpatric.mp3agic.Mp3File;
import lombok.Getter;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;

public class ArtworkHandler {
    private static final Logger logger = LoggerFactory.getLogger(ArtworkHandler.class);
    @Getter private static final File artworksDir = new File(FileHandler.getInstance().getApiRootDirectory().getAbsolutePath()+"/artworks/");

    private static final String ARTWORK_EXT = ".png";

    /**
     * Get the artwork root directory of a channel
     * @param channelId Channel's uuid
     */
    public static File getArtworkDirOfChannel(String channelId) {
        return new File(getArtworksDir().getAbsolutePath() + "/" + channelId);
    }

    /**
     * Extract the artwork of an mp3 file
     * @param mp3Data Mp3Data of the file
     */
    public static void extractArtwork(Mp3File mp3Data, String channelId, long timestamp){
        File dir = getArtworksDir();

        if(dir.exists()) {
            String filename = timestamp + ARTWORK_EXT;
            File channelArtworkDirectory = new File(getArtworkDirOfChannel(channelId) + "/current");
            File artworkFile = new File(channelArtworkDirectory.getAbsolutePath(), filename);

            // Delete other artwork files
            Arrays.asList(channelArtworkDirectory.listFiles()).forEach(file -> {
                try {
                    FileUtils.forceDelete(file);
                } catch (IOException ignored) {}
            });

            writeArtworkFile(artworkFile, mp3Data);
        }
    }

    /**
     * Write an extracted artwork to a file
     * @param file Extracted artwork
     * @param mp3File Mp3Data
     */
    public static void writeArtworkFile(File file, Mp3File mp3File) {
        try {
            if(file.exists()) FileUtils.forceDelete(file);
        } catch (IOException ignored) {}

        if (mp3File.hasId3v2Tag()) {
            try {
                String mimeType = mp3File.getId3v2Tag().getAlbumImageMimeType();
                byte[] bytes = mp3File.getId3v2Tag().getAlbumImage();

                if(bytes == null) {
                    return;
                }

                if(mimeType != null) {
                    if (!mimeType.equalsIgnoreCase("image/jpeg") && !mimeType.equalsIgnoreCase("image/png")) {
                        return;
                    }
                }

                FileUtils.writeByteArrayToFile(file, bytes);
            } catch (Exception ex) {
                logger.error("extractArtworkToApi(): Could not extract artwork: " + ex.getMessage());
            }
        }
    }

    /**
     * Move the current artwork to history
     * @param oldTimestamp Timestamp of the artwork on extraction
     * @param newTimestamp Timestamp of teh artwork on track end
     */
    public static void moveArtworkToHistory(String channelId, long oldTimestamp, long newTimestamp) {
        File channelArtworkDirectory = new File(getArtworkDirOfChannel(channelId) + "/current");
        File channelHistoryDirectory = new File(getArtworkDirOfChannel(channelId) + "/history");

        File currentArtwork = new File(channelArtworkDirectory.getAbsolutePath(), oldTimestamp + ARTWORK_EXT);
        File destArtwork = new File(channelHistoryDirectory.getAbsolutePath(), newTimestamp + ARTWORK_EXT);

        try {
            FileUtils.moveFile(currentArtwork, destArtwork);
        } catch (IOException ignored) { }
    }

    /**
     * Delete an artwork from history
     * @param channelId Channel's uuid
     * @param timestamp Timestamp of artwork
     */
    public static void deleteArtwork(String channelId, long timestamp) {
        File channelHistoryDirectory = new File(getArtworkDirOfChannel(channelId) + "/history");
        File artwork = new File(channelHistoryDirectory.getAbsolutePath(), timestamp + ARTWORK_EXT);

        try {
            FileUtils.forceDelete(artwork);
        } catch (IOException ignored) { }
    }

    /**
     * Clear all artworks for a channel
     * @param channelId Channel's uuid
     */
    public static void clearAllArtworks(String channelId) {
        File currentArtworkDirectory = new File(getArtworkDirOfChannel(channelId).getAbsolutePath() + "/current/");
        File historyArtworkDirectory = new File(getArtworkDirOfChannel(channelId).getAbsolutePath() + "/history/");

        // Create directories if they do not exist
        if(!currentArtworkDirectory.exists() || !historyArtworkDirectory.exists()) {
            try {
                Files.createDirectories(Path.of(currentArtworkDirectory.getAbsolutePath()));
                Files.createDirectories(Path.of(historyArtworkDirectory.getAbsolutePath()));
            } catch (IOException ignored) { }
        }

        // Search for files
        ArrayList<File> artworks = new ArrayList<>();
        artworks.addAll(Arrays.asList(currentArtworkDirectory.listFiles()));
        artworks.addAll(Arrays.asList(historyArtworkDirectory.listFiles()));

        // Delete all files
        artworks.forEach(file -> {
            try {
                FileUtils.forceDelete(file);
            } catch (IOException ignored) {}
        });
    }

}

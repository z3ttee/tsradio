package eu.tsalliance.streamer.files;

import com.mpatric.mp3agic.Mp3File;
import eu.tsalliance.streamer.Core;
import eu.tsalliance.streamer.channel.Channel;
import lombok.Getter;
import org.apache.commons.io.FileUtils;
import org.jetbrains.annotations.NotNull;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FileHandler {
    private static final Logger logger = LoggerFactory.getLogger(FileHandler.class);
    private static final File configFile = new File(System.getProperty("user.dir"), "config.json");

    private static FileHandler instance;

    @Getter private JSONObject config = null;
    @Getter private final File rootDirectory = new File(System.getProperty("user.dir"));
    @Getter private final File channelsRootDirectory = new File(rootDirectory.getAbsolutePath()+"/channels/");
    @Getter private final File apiRootDirectory = new File(rootDirectory.getAbsolutePath()+"/api/");
    @Getter private final File artworksDir = new File(apiRootDirectory.getAbsolutePath()+"/artworks/");

    public FileHandler(){
        this.loadConfig();
    }

    /**
     * Load config file data
     */
    public void loadConfig(){
        try {
            if(!configFile.exists()) {
                logger.info("loadConfig(): Config file does not exist. Creating it...");
                InputStream sysResIn = Core.class.getResourceAsStream("/config.json");

                createFile(configFile);
                createFileFromResources(sysResIn, configFile);
            }

            logger.info("loadConfig(): Loading config file...");

            FileReader reader = new FileReader(configFile);
            JSONParser parser = new JSONParser();

            config = (JSONObject) parser.parse(reader);
        } catch (IOException | ParseException e) {
            e.printStackTrace();
            logger.error("loadConfig(): An error occured during config initialization.");
        }
    }

    /**
     * Get the directory of a channel
     * @param channel Channel
     * @return File
     */
    public static File getDirOfChannel(Channel channel) {
        return new File(FileHandler.getInstance().getChannelsRootDirectory().getAbsolutePath() + "/" + channel.getMountpoint().replace("/", "") + "-" + channel.getUuid() + "/");
    }

    /**
     * Get the artwork root directory of a channel
     * @param channel Channel
     */
    public static File getArtworkDirOfChannel(Channel channel) {
        return new File(getInstance().getArtworksDir().getAbsolutePath() + "/" + channel.getUuid());
    }

    /**
     * Renames an existing channel directory
     * @param channel Channel
     * @param updatedChannel Channel's new data
     */
    public static void renameChannelDirectory(Channel channel, Channel updatedChannel) {
        File directory = getDirOfChannel(channel);
        File newDirectory = getDirOfChannel(updatedChannel);

        if(directory.getAbsolutePath().equals(newDirectory.getAbsolutePath())) {
            return;
        }

        // Old directory does not exist -> Create new updated directory
        if(!directory.exists()) {
            try {
                Files.createDirectories(Path.of(newDirectory.getAbsolutePath()));
            } catch (Exception ignored) {
                ignored.printStackTrace();
            }
            return;
        }

        // Update old directory to new directory
        try {
            FileUtils.moveDirectoryToDirectory(directory, newDirectory, true);
        } catch (Exception ignored) {
            ignored.printStackTrace();
        }
    }

    /**
     * Delete the directory of a channel
     * @param channel Channel
     */
    public static void deleteChannelDirectory(Channel channel) {
        try {
            File directory = getDirOfChannel(channel);
            if(directory.exists()) {
                FileUtils.forceDelete(getDirOfChannel(channel));
            }
        } catch (Exception ignored) {
            ignored.printStackTrace();
        }
    }

    /**
     * Create a file from a system resource
     * @param sysResIn System resource
     * @param dest Destination file
     * @throws IOException IOException when write fails
     */
    private static void createFileFromResources(InputStream sysResIn, File dest) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(sysResIn));
        PrintWriter writer = new PrintWriter(dest);
        String line;

        while((line = reader.readLine()) != null) {
            writer.println(line);
        }

        writer.flush();
        writer.close();
        reader.close();
    }

    /**
     * Creates a new file
     * @param file File to create
     * @throws IOException IOException when creation failed
     */
    private static void createFile(@NotNull File file) throws IOException {
        if(!file.createNewFile()) {
            logger.error("loadConfig(): Could not create file '"+file.getAbsolutePath()+"'.");
            logger.error("loadConfig(): This is a fatal error. Please resolve this issue, otherwise this service is unavailable.");
            System.exit(0);
        }
    }

    /**
     * Extract the artwork of an mp3 file
     * @param mp3Data Mp3Data of the file
     */
    public static void extractArtwork(Mp3File mp3Data, String channelId, long timestamp){
        File dir = FileHandler.getInstance().getArtworksDir();
        if(dir.exists()) {
            String filename = timestamp + ".png";
            File channelArtworkDirectory = new File(getInstance().getArtworksDir().getAbsolutePath() + "/" + channelId + "/current");
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
     * @param timestamp Timestamp of the artwork
     */
    public static void moveArtworkToHistory(String channelId, long timestamp) {
        logger.info("moveArtworkToHistory(): moving artwork");
        File channelArtworkDirectory = new File(getInstance().getArtworksDir().getAbsolutePath() + "/" + channelId + "/current");
        File channelHistoryDirectory = new File(getInstance().getArtworksDir().getAbsolutePath() + "/" + channelId + "/history");
        File currentArtwork = new File(channelArtworkDirectory.getAbsolutePath(), timestamp + ".png");

        try {
            FileUtils.moveFileToDirectory(currentArtwork, channelHistoryDirectory, true);
        } catch (IOException ignored) {
            ignored.printStackTrace();
        }
    }

    /**
     * Clear all artworks for a channel
     * @param channel Channel
     */
    public static void clearAllArtworks(Channel channel) {
        File currentArtworkDirectory = new File(getArtworkDirOfChannel(channel).getAbsolutePath() + "/current/");
        File historyArtworkDirectory = new File(getArtworkDirOfChannel(channel).getAbsolutePath() + "/history/");

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

    public static FileHandler getInstance() {
        if(instance == null) instance = new FileHandler();
        return instance;
    }
}

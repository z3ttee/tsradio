package eu.tsalliance.streamer.files;

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

public class FileHandler {
    private static final Logger logger = LoggerFactory.getLogger(FileHandler.class);
    private static final File configFile = new File(System.getProperty("user.dir"), "config.json");

    private static FileHandler instance;

    @Getter private JSONObject config = null;
    @Getter private final File rootDirectory = new File(System.getProperty("user.dir"));
    @Getter private final File channelsRootDirectory = new File(rootDirectory.getAbsolutePath()+"/channels/");
    @Getter private final File apiRootDirectory = new File(rootDirectory.getAbsolutePath()+"/api/");

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

    public static FileHandler getInstance() {
        if(instance == null) instance = new FileHandler();
        return instance;
    }
}

package live.tsradio.streamer.files;

import live.tsradio.streamer.Streamer;
import lombok.Getter;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;

@SuppressWarnings("SameParameterValue")
public class FileHandler {
    private static final Logger logger = LoggerFactory.getLogger(FileHandler.class);
    private static final File configFile = new File(System.getProperty("user.dir"), "config.json");

    private static FileHandler instance;

    @Getter private JSONObject config = null;
    @Getter private final File rootDirectory = new File(System.getProperty("user.dir"));
    @Getter private final File channelsRootDirectory = new File(rootDirectory.getAbsolutePath()+"/channels/");

    public FileHandler(){
        this.loadConfig();
    }

    public void loadConfig(){
        try {
            if(!configFile.exists()) {
                logger.info("loadConfig(): Config file does not exist. Creating it...");
                InputStream sysResIn = Streamer.class.getResourceAsStream("/config.json");

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

    private static void createFile(File file) throws IOException {
        if(!file.setReadable(true) && !file.setWritable(true)) {
            logger.error("loadConfig(): Could not set read/write permissions for file '"+file.getAbsolutePath()+"'.");
            logger.error("loadConfig(): This is a fatal error. Please resolve this issue, otherwise this service is unavailable.");
            System.exit(0);
            return;
        }

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

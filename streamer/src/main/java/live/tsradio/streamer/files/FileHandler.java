package live.tsradio.streamer.files;

import live.tsradio.streamer.Streamer;
import lombok.Getter;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.URISyntaxException;

public class FileHandler {
    private static final Logger logger = LoggerFactory.getLogger(FileHandler.class);
    private static final File configFile = new File(System.getProperty("user.dir"), "config.json");

    private static FileHandler instance;

    @Getter private JSONObject config = null;

    public FileHandler(){
        this.loadConfig();
    }

    public void loadConfig(){
        try {
            if(!configFile.exists()) {
                logger.info("loadConfig(): Config file does not exist. Creating it...");

                if(!configFile.setReadable(true) && !configFile.setWritable(true)) {
                    logger.error("loadConfig(): Could not set read/write permissions for file '"+configFile.getAbsolutePath()+"'.");
                    logger.error("loadConfig(): This is a fatal error. Please resolve this issue, otherwise this service is unavailable.");
                    System.exit(0);
                    return;
                }

                if(!configFile.createNewFile()) {
                    logger.error("loadConfig(): Could not create file '"+configFile.getAbsolutePath()+"'.");
                    logger.error("loadConfig(): This is a fatal error. Please resolve this issue, otherwise this service is unavailable.");
                    System.exit(0);
                    return;
                }

                File sysRes = new File(getClass().getResource("/config.json").toURI());

                BufferedReader reader = new BufferedReader(new FileReader(sysRes));
                PrintWriter writer = new PrintWriter(configFile);
                String line;

                while((line = reader.readLine()) != null) {
                    writer.write(line+"\n");
                }

                writer.flush();
                writer.close();
                reader.close();
            }

            logger.info("loadConfig(): Loading config file...");

            FileReader reader = new FileReader(configFile);
            JSONParser parser = new JSONParser();

            config = (JSONObject) parser.parse(reader);
        } catch (IOException | ParseException | URISyntaxException e) {
            e.printStackTrace();
            logger.error("loadConfig(): An error occured during config initialization.");
        }
    }

    public static FileHandler getInstance() {
        if(instance == null) instance = new FileHandler();
        return instance;
    }
}

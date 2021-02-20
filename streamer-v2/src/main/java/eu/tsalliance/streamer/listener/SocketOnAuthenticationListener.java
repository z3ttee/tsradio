package eu.tsalliance.streamer.listener;

import eu.tsalliance.streamer.channel.ChannelHandler;
import eu.tsalliance.streamer.socket.SocketClient;
import io.socket.emitter.Emitter;
import lombok.SneakyThrows;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SocketOnAuthenticationListener implements Emitter.Listener {
    private static final Logger logger = LoggerFactory.getLogger(SocketOnAuthenticationListener.class);

    @SneakyThrows
    @Override
    public void call(Object... args) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(String.valueOf(args[0]));

            boolean passed = Boolean.parseBoolean(jsonObject.get("passed").toString());

            if(!passed) {
                logger.error("Could not authenticate as streamer at socket '" + SocketClient.getInstance().getBaseUri() + "':");
                logger.error(jsonObject.get("errorId").toString() + " | " + jsonObject.get("message").toString());
            } else {
                logger.info("Successfully authenticated on socket server at '" + SocketClient.getInstance().getBaseUri() + "'");
                ChannelHandler.notifyAllChannelStates();
            }
        } catch (Exception ignored) { }
    }
}

package eu.tsalliance.streamer.listener;

import eu.tsalliance.streamer.Core;
import eu.tsalliance.streamer.socket.SocketClient;
import io.socket.emitter.Emitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SocketOnConnectListener implements Emitter.Listener {
    private static final Logger logger = LoggerFactory.getLogger(Core.class);

    @Override
    public void call(Object... args) {
        logger.info("Connected to socket server at '" + SocketClient.getInstance().getBaseUri() + "'");
    }
}

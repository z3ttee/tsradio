package eu.tsalliance.streamer.listener;

import io.socket.emitter.Emitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SocketOnDisconnectListener implements Emitter.Listener {
    private static final Logger logger = LoggerFactory.getLogger(SocketOnDisconnectListener.class);

    @Override
    public void call(Object... args) {
        logger.info("Disconnected from socket");
    }
}

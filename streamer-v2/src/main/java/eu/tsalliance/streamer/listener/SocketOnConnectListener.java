package eu.tsalliance.streamer.listener;

import eu.tsalliance.streamer.channel.ChannelHandler;
import io.socket.emitter.Emitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SocketOnConnectListener implements Emitter.Listener {
    private static final Logger logger = LoggerFactory.getLogger(SocketOnConnectListener.class);

    @Override
    public void call(Object... args) {
        logger.info("Connected to socket");
        ChannelHandler.notifyAllChannelStates();
        ChannelHandler.notifyAllChannelInfos();
        ChannelHandler.notifyAllChannelHistories();
    }
}

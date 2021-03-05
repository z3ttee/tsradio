package eu.tsalliance.streamer.socket;

import eu.tsalliance.streamer.files.FileHandler;
import eu.tsalliance.streamer.listener.*;
import eu.tsalliance.streamer.socket.packets.Packet;
import io.socket.client.IO;
import io.socket.client.Socket;
import lombok.Getter;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Collections;
import java.util.Map;

public class SocketClient {
    private static final Logger logger = LoggerFactory.getLogger(SocketClient.class);

    private static SocketClient instance;
    @Getter private final Socket socket;
    @Getter private final URI baseUri;

    public SocketClient() {
        // Assemble configured credentials
        JSONObject socketio = (JSONObject) FileHandler.getInstance().getConfig().get("socketio");
        Map<String, String> authPacket = new java.util.HashMap<>(Collections.emptyMap());
        authPacket.put("password", socketio.get("password").toString());

        // Prepare socket.io client
        this.baseUri = URI.create(socketio.get("baseUrl").toString());

        IO.Options options = IO.Options.builder()
                .setSecure(true)
                .setAuth(authPacket)
                .setReconnection(true)
                .setTransports(new String[]{"websocket"})
                .setPath("/radio/socket.io")
                .build();

        this.socket = IO.socket(this.baseUri, options);

        // Register events
        this.socket.on(SocketEvents.EVENT_CONNECT.getEventName(), new SocketOnConnectListener());
        this.socket.on(SocketEvents.EVENT_AUTHENTICATION.getEventName(), new SocketOnAuthenticationListener());
        this.socket.on(SocketEvents.EVENT_CHANNEL_UPDATE.getEventName(), new SocketOnChannelUpdateListener());
        this.socket.on(SocketEvents.EVENT_CHANNEL_DELETE.getEventName(), new SocketOnChannelDeleteListener());
        this.socket.on(SocketEvents.EVENT_TRACK_SKIP.getEventName(), new SocketOnTrackSkipListener());
        this.socket.on(SocketEvents.EVENT_DISCONNECT.getEventName(), new SocketOnDisconnectListener());

        // Connect to socket server
        this.socket.connect();
    }

    /**
     * Emit an event
     * @param event Event name
     * @param packet Packet to send as payload
     */
    public void broadcast(SocketEvents event, Packet packet) {
        this.socket.emit(event.getEventName(), packet.write());
    }

    /**
     * Restart socket client
     */
    public static void restart(){
        instance = null;
        getInstance();
    }

    public static SocketClient getInstance() {
        if(instance == null) instance = new SocketClient();
        return instance;
    }
}

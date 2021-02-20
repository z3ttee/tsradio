package eu.tsalliance.streamer.listener;

import eu.tsalliance.streamer.Core;
import eu.tsalliance.streamer.channel.Channel;
import eu.tsalliance.streamer.channel.ChannelHandler;
import eu.tsalliance.streamer.socket.SocketClient;
import io.socket.emitter.Emitter;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SocketOnChannelUpdateListener implements Emitter.Listener {

    @Override
    public void call(Object... args) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(String.valueOf(args[0]));

            String uuid = String.valueOf(jsonObject.get("uuid").toString());
            String mountpoint = String.valueOf(jsonObject.get("mountpoint").toString());
            boolean enabled = Boolean.parseBoolean(jsonObject.get("enabled").toString());

            if(uuid != null) {
                if(ChannelHandler.channelExists(uuid)) {
                    ChannelHandler.updateChannel(uuid, new Channel(uuid, mountpoint, enabled));
                } else {
                    ChannelHandler.registerChannel(new Channel(uuid, mountpoint, enabled));
                }
            }
        } catch (Exception ignored) { }
    }
}

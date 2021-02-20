package eu.tsalliance.streamer.listener;

import eu.tsalliance.streamer.channel.ChannelHandler;
import io.socket.emitter.Emitter;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class SocketOnTrackSkipListener implements Emitter.Listener {

    @Override
    public void call(Object... args) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(String.valueOf(args[0]));

            String uuid = String.valueOf(jsonObject.get("uuid").toString());

            if(uuid != null && ChannelHandler.channelExists(uuid) && ChannelHandler.isRunning(uuid)) {
                ChannelHandler.getChannel(uuid).skip();
            }
        } catch (Exception ignored) { }
    }
}

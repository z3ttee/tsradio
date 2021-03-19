package eu.tsalliance.streamer.socket.packets;

import eu.tsalliance.streamer.channel.ChannelState;
import lombok.Getter;

public class PacketOutStateChange extends Packet {

    @Getter private String uuid;
    @Getter private int state;

    public PacketOutStateChange(String uuid, ChannelState state) {
        this.uuid = uuid;
        this.state = state.getStateId();
    }
}

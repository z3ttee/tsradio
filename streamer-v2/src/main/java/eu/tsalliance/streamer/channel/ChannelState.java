package eu.tsalliance.streamer.channel;

import lombok.Getter;

public enum ChannelState {

    STATE_RUNNING(0, "running"),
    STATE_STREAMING(1, "streaming"),
    STATE_OFFLINE(2, "offline");

    @Getter private final int stateId;
    @Getter private final String name;
    ChannelState(int stateId, String name) {
        this.stateId = stateId;
        this.name = name;
    }
}

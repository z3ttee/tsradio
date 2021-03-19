package eu.tsalliance.streamer.socket;

import lombok.Getter;

public enum SocketEvents {

    EVENT_CONNECT("connect"),
    EVENT_DISCONNECT("disconnect"),
    EVENT_AUTHENTICATION("event_authentication"),
    EVENT_CHANNEL_STATE("event_channel_state"),
    EVENT_CHANNEL_UPDATE("event_channel_update"),
    EVENT_CHANNEL_DELETE("event_channel_delete"),

    EVENT_CHANNEL_INFO("event_channel_info"),
    EVENT_CHANNEL_HISTORY("event_channel_history"),

    EVENT_TRACK_SKIP("event_track_skip");

    @Getter private final String eventName;
    SocketEvents(String eventName) {
        this.eventName = eventName;
    }

}

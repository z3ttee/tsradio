import { Injectable } from "@nestjs/common";
import { Channel } from "src/channel/entities/channel.entity";
import { ChannelRegistry } from "src/channel/services/registry.service";
import { StreamerCoordinator } from "../coordinator/coordinator.service";
import { OnEvent } from "@nestjs/event-emitter";
import { EVENT_CHANNEL_CREATED } from "src/constants";
import { Stream } from "../entities/stream";

@Injectable()
export class StreamerService {

    private readonly streams: Map<string, Stream> = new Map();

    constructor(
        private readonly registry: ChannelRegistry,
        private readonly coordinator: StreamerCoordinator
    ) {
        // Start streamers
        for(const channel of registry.values()) {
            this.startStream(channel);
        }
    }

    public startStream(channel: Channel) {
        if(!this.streams.has(channel.id)) {
            const stream = new Stream(channel);
            this.streams.set(channel.id, stream);
            stream.start();
        }

        return this.streams.get(channel.id);
    }

    public getStreamByChannelId(channelId: string) {
        return this.streams.get(channelId);
    }

    @OnEvent(EVENT_CHANNEL_CREATED)
    public handleChannelCreatedEvent(channel: Channel) {
        this.startStream(channel);
    }

}
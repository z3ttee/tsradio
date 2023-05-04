import { Injectable, Logger } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Channel } from "src/channel/entities/channel.entity";
import { Stream, StreamStatus } from "../entities/stream";
import { GATEWAY_EVENT_CHANNEL_CREATED, GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_UPDATED } from "src/constants";
import { OnEvent } from "@nestjs/event-emitter";
import { ChannelRegistry } from "src/channel/services/registry.service";
import { HistoryService } from "src/history/services/history.service";
import { Page, Pageable, isNull } from "@soundcore/common";
import { AuthGateway } from "src/authentication/gateway/auth-gateway";
import { UserService } from "src/user/services/user.service";
import { OIDCService } from "src/authentication/services/oidc.service";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { User } from "src/user/entities/user.entity";

@Injectable()
@WebSocketGateway({ 
    cors: {
        origin: "*"
    },
    path: "/coordinator"
})
export class StreamerCoordinator extends AuthGateway {

    private readonly logger = new Logger(StreamerCoordinator.name);
    private readonly streams: Map<string, Stream> = new Map();

    @WebSocketServer()
    public server: Server;

    constructor(
        userService: UserService,
        oidcService: OIDCService,
        private readonly historyService: HistoryService,
        private readonly registry: ChannelRegistry
    ) {
        super(userService, oidcService);

        // Start streamers
        for(const channel of this.registry.values()) {
            this.startStream(channel);
        }
    }

    protected onConnect(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, user: User): Promise<void> {
        console.log("connected");
        return;
    }

    /**
     * Guard function that checks if the user is allowed to access
     * this gateway
     * @param roles Array of roles the user belongs to
     * @returns True, if user is allowed to connect. Otherwise false
     */
    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return true;
    }

    /**
     * Emit channel deletion event
     * @param channelId Id of the channel that was deleted
     */
    public async emitChannelDeleted(channelId: string): Promise<void> {
        this.server.emit(GATEWAY_EVENT_CHANNEL_DELETED, channelId);
    }

    /**
     * Emit channel update event
     * @param channel Updated channel data
     */
    public async emitChannelUpdated(channel: Channel): Promise<void> {
        this.server.emit(GATEWAY_EVENT_CHANNEL_DELETED, channel);
    }

    /**
     * Emit channel creation event.
     * The event will only be emitted, if the created channel is enabled
     * @param channel Created channel data 
     */
    public async emitChannelCreated(channel: Channel): Promise<void> {
        if(!channel.enabled) return;
        this.server.emit(GATEWAY_EVENT_CHANNEL_CREATED, channel);
    }

    public async startStream(channel: Channel): Promise<Stream> {
        if(!this.streams.has(channel.id)) {
            const stream = new Stream(channel);
            
            this.subscribeToStreamEvents(stream);

            this.streams.set(channel.id, stream);
            stream.start().subscribe();
        }

        return this.streams.get(channel.id);
    }

    public async stopStream(channelId: string): Promise<void> {
        if(!this.streams.has(channelId)) return;

        const stream = this.streams.get(channelId);
        stream.shutdown().subscribe();
    }

    public async updateChannelOfStream(channel: Channel): Promise<void> {
        if(!this.streams.has(channel.id)) return;

        const stream = this.streams.get(channel.id);
        stream.channel = channel;
    }

    public getStreamByChannelId(channelId: string) {
        return this.streams.get(channelId);
    }

    public async findActiveChannels(pageable: Pageable): Promise<Page<Channel>> {
        const streams = Array.from(this.streams.values()).filter((s) => s.status === StreamStatus.ONLINE);

        const offset = Math.min(streams.length, Math.max(0, pageable.offset));
        const limit = Math.min(streams.length, Math.min(streams.length-offset, Math.max(1, pageable.limit)));

        return Page.of(streams.slice(offset, limit).map((s) => s.channel), streams.length, pageable);
    }

    @OnEvent(GATEWAY_EVENT_CHANNEL_CREATED)
    public handleChannelCreatedEvent(channel: Channel) {
        this.startStream(channel);
        this.emitChannelCreated(channel);
    }

    @OnEvent(GATEWAY_EVENT_CHANNEL_DELETED)
    public handleChannelDeletedEvent(channelId: string) {
        this.stopStream(channelId);
        this.emitChannelDeleted(channelId);
    }

    @OnEvent(GATEWAY_EVENT_CHANNEL_UPDATED)
    public handleChannelUpdatedEvent(channel: Channel) {
        this.updateChannelOfStream(channel);
        this.emitChannelUpdated(channel);
    }

    private subscribeToStreamEvents(stream: Stream): void {
        // Subscribe to changes to current track
        stream.$currentTrack.subscribe((track) => {
            if(isNull(track)) return;
            this.historyService.addToHistory(stream.channel.id, track);
        });

        // Subscribe to shutdown event
        stream.$onDestroyed.subscribe(() => {
            this.logger.warn(`Channel '${stream.name}' shut down`);
        });

        // Subscribe to status changes
        stream.$status.subscribe((status) => {
            this.logger.log(`Channel '${stream.name}' changed status to '${status.toString().toUpperCase()}'`);
        });

        // Subscribe to track changes
        stream.$currentTrack.subscribe((track) => {
            if(isNull(track)) return;
            this.logger.log(`Channel '${stream.name}' now playing: '${track.name}' by '${track.primaryArtist}'`);
        });

        // Subscribe to errors
        stream.$onError.subscribe((error) => {
            this.logger.error(`Channel '${stream.name}' caught an error: ${error.message}`, error);
        });

        // Subscribe to channel updates
        stream.$onChannelUpdated.subscribe(() => {
            this.logger.log(`Channel metadata was updated for '${stream.name}'`);
        });
    }

}
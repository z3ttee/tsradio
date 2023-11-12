import { Injectable, Logger } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Stream, StreamStatus } from "../entities/stream";
import { OnEvent } from "@nestjs/event-emitter";
import { AuthGateway } from "../../authentication/gateway/auth-gateway";
import { UserService } from "../../user/services/user.service";
import { OIDCService } from "../../authentication/services/oidc.service";
import { HistoryService } from "../../history/services/history.service";
import { ChannelRegistry } from "../../channel/services/registry.service";
import { GATEWAY_EVENT_CHANNEL_CREATED, GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_DISABLED, GATEWAY_EVENT_CHANNEL_REQUEST_RESTART, GATEWAY_EVENT_CHANNEL_STATUS_CHANGED, GATEWAY_EVENT_CHANNEL_TRACK_CHANGED, GATEWAY_EVENT_CHANNEL_UPDATED } from "../../constants";
import { Channel } from "../../channel/entities/channel.entity";
import { isNull } from "@tsa/utilities";
import { ChannelService } from "../../channel/services/channel.service";
import { Track, TrackService } from "../../track";

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
        private readonly channelService: ChannelService,
        private readonly trackService: TrackService,
        private readonly historyService: HistoryService,
        private readonly registry: ChannelRegistry
    ) {
        super(userService, oidcService);

        // Start streamers
        for(const channel of this.registry.values()) {
            this.startStream(channel);
        }
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
        this.server?.emit(GATEWAY_EVENT_CHANNEL_DELETED, channelId);
    }

    /**
     * Emit channel status changed event
     * @param channelId Id of the channel that changed status
     */
    public async emitStatusChanged(channelId: string, status: StreamStatus): Promise<void> {
        this.server?.emit(GATEWAY_EVENT_CHANNEL_STATUS_CHANGED, channelId, status);
    }

    /**
     * Emit channel update event
     * @param channel Updated channel data
     */
    public async emitChannelUpdated(channel: Channel): Promise<void> {
        this.server?.emit(GATEWAY_EVENT_CHANNEL_UPDATED, channel);
    }

    /**
     * Emit channel update event
     * @param channel Updated channel data
     */
    public async emitChannelTrackChanged(channelId: string, track: Track): Promise<void> {
        const { filename, ...trackData } = track;
        this.server?.emit(GATEWAY_EVENT_CHANNEL_TRACK_CHANGED, channelId, trackData);
    }

    /**
     * Emit channel creation event.
     * The event will only be emitted, if the created channel is enabled
     * @param channel Created channel data 
     */
    public async emitChannelCreated(channel: Channel): Promise<void> {
        if(!channel.enabled) return;
        this.server?.emit(GATEWAY_EVENT_CHANNEL_CREATED, channel);
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
        stream.setChannel(channel);
    }

    public getStreamByChannelId(channelId: string) {
        return this.streams.get(channelId);
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

    @OnEvent(GATEWAY_EVENT_CHANNEL_DISABLED)
    public handleChannelDisabledEvent(channelId: string) {
        // Currently, the disable event
        // is treated like a delete event
        this.handleChannelDeletedEvent(channelId);
    }

    @OnEvent(GATEWAY_EVENT_CHANNEL_UPDATED)
    public handleChannelUpdatedEvent(channel: Channel) {
        this.updateChannelOfStream(channel);
        this.emitChannelUpdated(channel);
    }

    @OnEvent(GATEWAY_EVENT_CHANNEL_REQUEST_RESTART)
    public handleRequestRestart(channel: Channel) {
        this.restartStreamByChannel(channel);
    }

    public async restartStreamByChannel(channel: Channel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const id = channel.id;

            const stream = this.streams.get(id);
            if(isNull(stream)) {
                this.logger.warn(`Could not restart stream with id '${id}': No stream running for this channel.`);
                return resolve(false);
            }

            stream.shutdown().subscribe(() => {
                this.streams.delete(id);
                this.startStream(channel).then((stream) => {
                    resolve(true);
                });
            });
        }).then((restarted) => {
            if(restarted) this.logger.log(`Channel '${channel.name}' successfully restarted.`);
            return restarted;
        });
    }

    private subscribeToStreamEvents(stream: Stream): void {
        // Subscribe to status changes
        stream.$status.subscribe((status) => {
            // Update status of channel in the database
            this.channelService.setStatus(stream.id, status).then((status) => {
                // On success, log status change to console
                // and emit status event
                this.logger.log(`Channel '${stream.name}' changed status to '${status.toString().toUpperCase()}'`);
                this.emitStatusChanged(stream.getChannel().id, status);
            }).catch((error: Error) => {
                // Handle error and log
                // to console
                this.logger.error(`Failed updating channel status in database: ${error.message}`, error.stack);
            });
        });

        // Subscribe to shutdown event
        stream.$onDestroyed.subscribe(() => {
            // this.logger.warn(`Channel '${stream.name}' shut down`);
            // this.emitStatusChanged(stream.getChannel().id, StreamStatus.OFFLINE);
            this.streams.delete(stream.id);
        });

        // Subscribe to track changes
        stream.$currentTrack.subscribe(async (currentTrack) => {
            if(isNull(currentTrack)) return;
            this.historyService.addToHistory(stream.id, currentTrack);

            const track: Track | null = await this.trackService.createOrFind({
                channelId: stream.id,
                name: currentTrack.name,
                album: null,
                primaryArtistName: currentTrack.primaryArtist?.name,
                featuredArtistNames: currentTrack.featuredArtists?.map((a) => a.name),
                filename: currentTrack.filename
            }).catch((error: Error) => {
                this.logger.error(`Failed syncing track with database: ${error.message}`, error.stack);
                return null;
            });

            this.logger.log(`Channel '${stream.name}' now playing: '${track?.name}' by '${track?.primaryArtist?.name}'`);
            this.emitChannelTrackChanged(stream.getChannel().id, track);
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
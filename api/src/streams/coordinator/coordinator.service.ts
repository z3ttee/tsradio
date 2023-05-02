import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Channel } from "src/channel/entities/channel.entity";
import { Stream } from "../entities/stream";
import { EVENT_CHANNEL_CREATED } from "src/constants";
import { OnEvent } from "@nestjs/event-emitter";
import { ChannelRegistry } from "src/channel/services/registry.service";
import { HistoryService } from "src/history/services/history.service";
import { isNull } from "@soundcore/common";

@Injectable()
@WebSocketGateway({ 
    cors: {
        origin: "*"
    },
    path: "/coordinator"
})
export class StreamerCoordinator implements OnGatewayConnection, OnGatewayDisconnect {

    private readonly logger = new Logger(StreamerCoordinator.name);
    private readonly streams: Map<string, Stream> = new Map();

    private readonly channels: Map<string, Channel> = new Map();
    private readonly socket2channel: Map<string, string> = new Map();
    private readonly channel2socket: Map<string, Socket> = new Map();

    @WebSocketServer()
    public server: Server;

    constructor(
        private readonly historyService: HistoryService,
        private readonly registry: ChannelRegistry
    ) {
        // Start streamers
        for(const channel of this.registry.values()) {
            this.startStream(channel);
        }
    }


    public async startStream(channel: Channel): Promise<Stream> {
        if(!this.streams.has(channel.id)) {
            const stream = new Stream(channel);

            stream.$currentTrack.subscribe((track) => {
                if(isNull(track)) return;
                this.historyService.addToHistory(stream.channel.id, track);
            });

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

    public async handleConnection(socket: Socket): Promise<any> {
        // return new Promise<Channel>((resolve, reject) => {
        //     const tokenValue = socket.handshake.auth["secret"];
        //     resolve(this.verify(tokenValue));
        // }).then((channel) => {
        //     this.channels.set(channel.id, channel);
        //     this.socket2channel.set(socket.id, channel.id);
        //     this.channel2socket.set(channel.id, socket);

        //     this.logger.log(`Streamer for channel '${channel.name}' went online.`);
        // }).catch((err: Error) => {
        //     this.logger.error(`An unknown client wanted to connect to the coordinator and got blocked: ${err.message}`);
        //     socket.disconnect();
        // });
    }

    public handleDisconnect(socket: Socket) {
        // const channelId = this.socket2channel.get(socket.id);
        // const channel = this.channels.get(channelId);

        // this.channels.delete(channelId);
        // this.socket2channel.delete(socket.id);
        // this.channel2socket.delete(channelId);

        // this.logger.log(`Streamer for channel '${channel.name}' went offline.`);
    }

}
import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { randomString } from "@soundcore/common";
import { Server, Socket } from "socket.io";
import { Channel } from "src/channel/entities/channel.entity";

@Injectable()
@WebSocketGateway({ 
    cors: {
        origin: "*"
    },
    path: "/coordinator"
})
export class StreamerCoordinator implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    private readonly logger = new Logger(StreamerCoordinator.name);

    private readonly channels: Map<string, Channel> = new Map();
    private readonly socket2channel: Map<string, string> = new Map();
    private readonly channel2socket: Map<string, Socket> = new Map();

    @WebSocketServer()
    public server: Server;

    private secret: string = randomString(4096);

    constructor(
        private readonly jwt: JwtService
    ) {}

    public afterInit(server: Server) {
        this.logger.log(`Waiting for streamers to come online...`);
    }

    /**
     * Issue a token for a channel
     * @param channel Channel data
     * @returns Token as string
     */
    public issueToken(channel: Channel): string {
        return this.jwt.sign(JSON.parse(JSON.stringify(channel)), { secret: this.secret })
    }

    /**
     * Verify token
     * @param token Token string to verify
     * @returns Channel object
     */
    public verify(token: string): Channel {
        return this.jwt.verify(token, { ignoreExpiration: true, secret: this.secret });
    }

    public async handleConnection(socket: Socket): Promise<any> {
        return new Promise<Channel>((resolve, reject) => {
            const tokenValue = socket.handshake.auth["secret"];
            resolve(this.verify(tokenValue));
        }).then((channel) => {
            this.channels.set(channel.id, channel);
            this.socket2channel.set(socket.id, channel.id);
            this.channel2socket.set(channel.id, socket);

            this.logger.log(`Streamer for channel '${channel.name}' went online.`);
        }).catch((err: Error) => {
            this.logger.error(`An unknown client wanted to connect to the coordinator and got blocked: ${err.message}`);
            socket.disconnect();
        });
    }

    public handleDisconnect(socket: Socket) {
        const channelId = this.socket2channel.get(socket.id);
        const channel = this.channels.get(channelId);

        this.channels.delete(channelId);
        this.socket2channel.delete(socket.id);
        this.channel2socket.delete(channelId);

        this.logger.log(`Streamer for channel '${channel.name}' went offline.`);
    }

}
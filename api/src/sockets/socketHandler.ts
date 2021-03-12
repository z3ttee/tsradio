import { Server, Socket } from "socket.io"
import { Alliance } from "../alliance/alliance"
import { Member } from "../alliance/member"
import config from "../config/config"
import { TrustedError } from "../error/trustedError"
import ChannelHandler from "../handler/channelHandler"
import { VoteHandler } from "../handler/voteHandler"
import { OnChannelHistoryChange } from "../listener/OnChannelHistoryChange"
import { OnChannelInfoChange } from "../listener/OnChannelInfoChange"
import { OnChannelStateChange } from "../listener/OnChannelStateChange"
import Packet from "../packets/Packet"
import PacketOutAuthentication from "../packets/PacketOutAuthentication"
import { SocketClient } from "./socketClient"
import { SocketEvents } from "./socketEvents"

export class SocketHandler {
    private static instance: SocketHandler = undefined

    public readonly server: Server
    public readonly connectedClients: Map<String, SocketClient> = new Map<String, SocketClient>()
    public connectedStreamer: SocketClient.SocketStreamer = undefined

    constructor() {
        this.server = new Server({
            cors: {
                origin: '*'
            }
        })

        // Event when new client connects
        this.server.on('connection', async (socket) => {
            this.registerSocketClient(socket)

            socket.on("disconnect", () => {
                this.removeSocketClient(socket)
            })
        })
    }

    /**
     * Broadcast to streamer
     * @param event Event
     * @param packet Data to be sent
     */
    public async broadcastToStreamer(event: SocketEvents, packet: Packet) {
        this.connectedStreamer?.socket.emit(event, JSON.stringify(packet))
    }

    /**
     * Broadcast to all listeners
     * @param event Event
     * @param packet Data to be sent
     */
    public async broadcast(event: SocketEvents, packet: Packet) {
        for(let client of this.connectedClients.values()) {
            client.socket.emit(event, packet)
        }
    }

    public async broadcastWithoutPermission(event: SocketEvents, packet: Packet, permission: string) {
        for(let client of this.connectedClients.values()) {
            if(!client.hasPermission(permission)) {
                client.socket.emit(event, packet)
            }
        }
    }

    public async broadcastWithPermission(event: SocketEvents, packet: Packet, permission: string) {
        for(let client of this.connectedClients.values()) {
            if(client.hasPermission(permission)) {
                client.socket.emit(event, packet)
            }
        }
    }

    /**
     * Broadcast to all listeners in specific room
     * @param room Room
     * @param event Event
     * @param packet Data to be sent
     */
    public async broadcastToRoom(room: string, event: SocketEvents, packet: Packet) {
        for(let client of this.connectedClients.values()) {
            client.socket.to(room).emit(event, packet)
        }
    }

    /**
     * Register a newly connected socket as client. Simultaneously authenticates client with given auth data
     * @param socket 
     */
    private async registerSocketClient(socket: Socket) {
        let handShakeData = socket.handshake
        if(handShakeData.auth) {
            if(handShakeData.auth["password"]) {
                // Login as streamer source
                if(handShakeData.auth["password"] != config.socketio.password) {
                    return this.registerAsGuest(socket)
                } else {
                    console.log("Registering as streamer...");
                    
                    this.registerAsStreamer(socket);
                }
            } else if(handShakeData.auth["token"]) {
                // Login as member
                let member = await Alliance.getInstance().authenticateMemberByToken(handShakeData.auth["token"])                
                if(member instanceof TrustedError) {
                    return this.registerAsGuest(socket)
                }
                this.registerAsMember(socket, member)
            } else {
                // Login as guest
                return this.registerAsGuest(socket)
            }
        }
    }

    /**
     * Register a newly connected socket as client. Simultaneously authenticates client with given auth data
     * @param socket 
     */
    private async removeSocketClient(socket: Socket) {
        if(socket.id == this.connectedStreamer?.socket.id) {
            ChannelHandler.resetAllChannels()
            this.connectedStreamer = undefined
        } else {
            let socketClient = this.connectedClients.get(socket.id)

            if(socketClient instanceof SocketClient.SocketMember) {
                // Remove member from listeners and from votings                
                await ChannelHandler.removeMember(socketClient)
                await VoteHandler.removeVote(socketClient.getCurrentChannel()?.uuid, socketClient.profile.uuid)
            }
            this.connectedClients.delete(socket.id)
        }
    }

    /**
     * Register a socket as guest
     * @param socket Socket client
     * @param trustedError (Optional) Error that caused the socket to be classified as guest
     */
    private async registerAsGuest(socket: Socket, trustedError?: TrustedError) {
        trustedError = !!trustedError ? trustedError : TrustedError.get(TrustedError.Errors.AUTH_REQUIRED)

        socket.emit(SocketEvents.EVENT_AUTHENTICATION, new PacketOutAuthentication(false, trustedError.message, trustedError.errorId) )
        this.connectedClients.set(socket.id, new SocketClient.SocketGuest(socket))
    }

    /**
     * Register a socket as member
     * @param socket Socket client
     * @param member Member's data to associate with socket
     */
    private async registerAsMember(socket: Socket, member: Member) {
        socket.emit(SocketEvents.EVENT_AUTHENTICATION, new PacketOutAuthentication(true))
        this.connectedClients.set(socket.id, new SocketClient.SocketMember(socket, new Member.Profile(member.uuid, member.name), member.role?.permissions))
    }

    /**
     * Register a socket as streamer
     * @param socket Socket client
     */
    private async registerAsStreamer(socket: Socket) {
        socket.emit(SocketEvents.EVENT_AUTHENTICATION, new PacketOutAuthentication(true))

        this.connectedStreamer = new SocketClient.SocketStreamer(socket)
        this.connectedStreamer.socket.on(SocketEvents.EVENT_CHANNEL_STATE, (args) => {
            OnChannelStateChange.onStateChange(JSON.parse(args) as OnChannelStateChange.ChannelStatePacket)
        })
        this.connectedStreamer.socket.on(SocketEvents.EVENT_CHANNEL_INFO, (args) => {
            OnChannelInfoChange.onInfoChange(JSON.parse(args) as OnChannelInfoChange.ChannelInfoPacket)
        })
        this.connectedStreamer.socket.on(SocketEvents.EVENT_CHANNEL_HISTORY, (args) => {
            OnChannelHistoryChange.onHistoryChange(JSON.parse(args) as OnChannelHistoryChange.ChannelHistoryPacket)
        })
    }

    /**
     * Get SocketMember instance by Member id
     * @param memberId Member's id
     * @returns SocketMember
     */
    public getSocketMemberByMemberId(memberId: string): SocketClient.SocketMember {        
        var clients = this.connectedClients.values()

        for(var c of clients) {
            if(c instanceof SocketClient.SocketMember && c.profile.uuid == memberId) {
                return c
            }
        }
    }

    public static getInstance() {
        if(!this.instance) this.instance = new SocketHandler()
        return this.instance
    }
}
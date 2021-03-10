import { Socket } from "socket.io";
import { Member } from "../alliance/member";
import ChannelHandler from "../handler/channelHandler";
import { Channel } from "../models/channel";

export abstract class SocketClient {
    public readonly socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    abstract hasPermission(permission: string)
}

export namespace SocketClient {
    export class SocketMember extends SocketClient {
        public readonly profile: Member.Profile
        public readonly permissions?: Array<String>
        private currentChannelId?: string

        constructor(socket: Socket, profile: Member.Profile, permissions?: Array<String>) {
            super(socket)
            this.profile = profile
            this.permissions = permissions
        }

        public hasPermission(permission: string) {
            return this?.permissions?.includes(permission)
        }

        public getCurrentChannel(): Channel {
            return ChannelHandler.getChannel(this.currentChannelId)
        }

        public setCurrentChannel(channel: Channel) {
            this.currentChannelId = channel.uuid
            
            this.socket.leave("channel-" + this.currentChannelId)
            this.socket.join("channel-" + channel.uuid)
        }
    }

    export class SocketStreamer extends SocketClient {
        constructor(socket: Socket) {
            super(socket)
        }

        public hasPermission(permission: string) {
            return true
        }
    }

    export class SocketGuest extends SocketClient {
        constructor(socket: Socket) {
            super(socket)
        }

        public hasPermission(permission: string) {
            return false
        }
    }
}
import { Socket } from "socket.io";
import { Member } from "../alliance/member";
import { Channel } from "../models/channel";
import { SocketEvents } from "./socketEvents";
import { SocketHandler } from "./socketHandler";

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
        public readonly permissions: Array<String>

        constructor(socket: Socket, profile: Member.Profile, permissions: Array<String>) {
            super(socket)
            this.profile = profile
            this.permissions = permissions
        }

        public hasPermission(permission: string) {
            return this.permissions.includes(permission)
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
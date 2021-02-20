import { Channel } from "../models/channel"

export namespace OnChannelStateChange {
    export function onStateChange(packet: ChannelStatePacket) {
        if(packet.state == Channel.ChannelState.STATE_OFFLINE || packet.state == Channel.ChannelState.STATE_RUNNING) {
            // TODO: Send channel removal to listeners
            console.log("channel not streaming")
        } else {
            // TODO: Send channel to listeners
            console.log("channel streaming")
        }
    }

    export class ChannelStatePacket {
        public readonly uuid: string
        public readonly state: Number

        constructor(uuid: string, state: Number) {
            this.uuid = uuid
            this.state = state
        }
    }
}
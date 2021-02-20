import ChannelHandler from "../handler/channelHandler"
import { Channel } from "../models/channel"

export namespace OnChannelStateChange {
    export function onStateChange(packet: ChannelStatePacket) {
        if(packet.state == Channel.ChannelState.STATE_OFFLINE || packet.state == Channel.ChannelState.STATE_RUNNING) {
            ChannelHandler.updateState(packet.uuid, packet.state == Channel.ChannelState.STATE_OFFLINE ?  Channel.ChannelState.STATE_OFFLINE : Channel.ChannelState.STATE_RUNNING)
        } else {
            ChannelHandler.updateState(packet.uuid, Channel.ChannelState.STATE_STREAMING)
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
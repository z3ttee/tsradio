import ChannelHandler from "../handler/channelHandler"
import { Channel } from "../models/channel"

export namespace OnChannelStateChange {
    export function onStateChange(packet: ChannelStatePacket) {
        if(packet.state == Channel.ChannelState.STATE_STREAMING) {
            ChannelHandler.updateState(packet.uuid, Channel.ChannelState.STATE_STREAMING)
        } else {
            let state: Channel.ChannelState

            if(packet.state == Channel.ChannelState.STATE_OFFLINE) state = Channel.ChannelState.STATE_OFFLINE
            if(packet.state == Channel.ChannelState.STATE_RUNNING) state = Channel.ChannelState.STATE_RUNNING
            if(packet.state == Channel.ChannelState.STATE_PREPARING) state = Channel.ChannelState.STATE_PREPARING

            ChannelHandler.updateState(packet.uuid, state)
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
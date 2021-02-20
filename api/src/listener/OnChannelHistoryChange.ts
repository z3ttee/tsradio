import ChannelHandler from "../handler/channelHandler"
import { OnChannelInfoChange } from "./OnChannelInfoChange"

export namespace OnChannelHistoryChange {
    export function onHistoryChange(packet: ChannelHistoryPacket) {
        ChannelHandler.setChannelHistory(packet.uuid, packet.tracks)
    }

    export class ChannelHistoryPacket {
        public readonly uuid: string
        public readonly tracks: Array<OnChannelInfoChange.ChannelInfoPacket>

        constructor(uuid: string, tracks: Array<OnChannelInfoChange.ChannelInfoPacket>) {
            this.uuid = uuid
            this.tracks = tracks
        }
    }
}
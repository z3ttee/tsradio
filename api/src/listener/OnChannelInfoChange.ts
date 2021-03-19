import ChannelHandler from "../handler/channelHandler"

export namespace OnChannelInfoChange {
    export function onInfoChange(packet: ChannelInfoPacket) {
        ChannelHandler.setChannelInfo(packet.uuid, {
            title: packet.title,
            artist: packet.artist,
            timestamp: packet.timestamp
        })
    }

    export class ChannelInfoPacket {
        public readonly uuid: string
        public readonly title: string
        public readonly artist: string
        public readonly timestamp: Number

        constructor(uuid: string, title: string, artist: string, timestamp: Number) {
            this.uuid = uuid
            this.title = title
            this.artist = artist
            this.timestamp = timestamp
        }
    }
}
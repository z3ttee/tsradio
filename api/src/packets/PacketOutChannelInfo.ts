import Packet from "./Packet"

export default class PacketOutChannelInfo extends Packet {

    public readonly uuid: string
    public readonly title: string
    public readonly artist: string
    public readonly cover: string

    constructor(uuid: string, title: string, artist: string, cover: string) {
        super()
        this.uuid = uuid
        this.title = title
        this.artist = artist
        this.cover = cover
    }

}
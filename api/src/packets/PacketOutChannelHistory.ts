import { Channel } from "../models/channel"
import Packet from "./Packet"

export default class PacketOutChannelHistory extends Packet {

    public readonly uuid: string
    public readonly tracks: Array<Channel.ChannelInfo>

    constructor(uuid: string, tracks: Array<Channel.ChannelInfo>) {
        super()
        this.uuid = uuid
        this.tracks = tracks
    }

}
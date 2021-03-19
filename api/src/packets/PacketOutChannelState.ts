import { Channel } from "../models/channel"
import Packet from "./Packet"

export default class PacketOutChannelState extends Packet {

    public readonly uuid: string
    public readonly state: Channel.ChannelState

    constructor(uuid: string, state: Channel.ChannelState) {
        super()
        this.uuid = uuid
        this.state = state
    }

}
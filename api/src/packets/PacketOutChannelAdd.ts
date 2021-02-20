import Packet from "./Packet"

export default class PacketOutChannelAdd extends Packet {

    public readonly uuid: string

    constructor(uuid: string) {
        super()
        this.uuid = uuid
    }

}
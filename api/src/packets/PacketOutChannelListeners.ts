import Packet from "./Packet"

export default class PacketOutChannelListeners extends Packet {

    public readonly uuid: string
    public readonly listeners: Number

    constructor(uuid: string, listeners: Number) {
        super()
        this.uuid = uuid
        this.listeners = listeners
    }

}
import Packet from "./Packet"

export default class PacketOutChannelUpdate extends Packet {

    public readonly uuid: string
    public readonly mountpoint: string
    public readonly enabled: Boolean

    constructor(uuid: string, mountpoint: string, enabled: Boolean) {
        super()
        this.uuid = uuid
        this.mountpoint = mountpoint
        this.enabled = enabled
    }

}
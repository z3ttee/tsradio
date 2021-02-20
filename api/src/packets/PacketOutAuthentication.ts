import Packet from "./Packet"

export default class PacketOutAuthentication extends Packet {

    public readonly passed: Boolean
    public readonly errorId?: String
    public readonly message?: String

    constructor(passed: Boolean, errorId?: String, message?: String) {
        super()
        this.passed = passed
        this.errorId = errorId
        this.message = message
    }

}
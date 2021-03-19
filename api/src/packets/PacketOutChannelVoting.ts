import { VoteHandler } from "../handler/voteHandler"
import Packet from "./Packet"

export default class PacketOutChannelVoting extends Packet {

    public readonly uuid: string
    public readonly category: VoteHandler.VoteCategory
    public readonly result: Map<string, number>
    public readonly state: VoteHandler.VotingState
    public readonly endsAt: Date

    constructor(uuid: string, category: VoteHandler.VoteCategory, result: Map<string, number>, state: VoteHandler.VotingState, endsAt: Date) {
        super()
        this.uuid = uuid
        this.category = category
        this.result = result
        this.state = state
        this.endsAt = endsAt
    }

}
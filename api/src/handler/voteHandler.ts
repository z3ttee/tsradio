import PacketOutChannelVoting from "../packets/PacketOutChannelVoting"
import { SocketEvents } from "../sockets/socketEvents"
import { SocketHandler } from "../sockets/socketHandler"
import config from '../config/config'
import PacketOutChannelSkip from "../packets/PacketOutChannelSkip"
import ChannelHandler from "./channelHandler"

export class VoteHandler {

    private static votings: Map<string, VoteHandler.Voting> = new Map()
    private static cooldowns: Map<string, Date> = new Map()

    /**
     * Check if there is already a voting in progress
     * @param channelId Channel's id
     * @returns True or False
     */
    public static hasPendingVoting(channelId: string): Boolean {
        return this.votings.has(channelId)
    }

    /**
     * Check if a channel has a pending cooldown before a new voting can be started
     * @param channelId Channel's id
     * @returns True or False
     */
    public static hasCooldown(channelId: string): Boolean {
        if(this.cooldowns.get(channelId)?.getTime() < Date.now()) {
            this.cooldowns.delete(channelId)
            return false
        } else {
            return true
        }
    }

    /**
     * Check if a member has already voted
     * @param channelId Channel's id
     * @param memberId Member's id
     */
    public static hasVoted(channelId: string, memberId: string): Boolean {
        if(!this.hasPendingVoting(channelId)) return false

        var voting = this.votings.get(channelId)
        return voting.votes.has(memberId)
    }

    /**
     * Add a vote to a voting or init new voting
     * @param channelId Channel's id
     * @param category Voting Category
     * @param memberId Member's id
     * @param value Vote value
     */
    public static addVote(channelId: string, category: VoteHandler.VoteCategory, memberId: string, value: any) {
        var voting: VoteHandler.Voting

        if(!this.hasPendingVoting(channelId)) {
            voting = new VoteHandler.Voting(channelId, category)
        } else {
            voting = this.votings.get(channelId)
        }

        voting.addVote(memberId, value)
    }

    /**
     * Remove a vote from pending voting
     * @param channelId Channel's id
     * @param memberId Member's id
     */
    public static removeVote(channelId: string, memberId: string) {
        if(!this.hasPendingVoting(channelId)) return

        var voting = this.votings.get(channelId)
        voting.removeVote(memberId)
    }

    /**
     * Set cooldown of channel voting
     * @param channelId Channel's id
     * @param durationInSeconds Duration in seconds
     */
    public static setCooldown(channelId: string, durationInSeconds: number) {
        this.votings.delete(channelId)
        this.cooldowns.set(channelId, new Date((Date.now() + (durationInSeconds * 1000))))
    }

    /**
     * Abort voting in channel
     */
    public static async abort(channelId: string) {
        this.votings.get(channelId)?.abort()
    }

    /**
     * Abort all votings
     */
    public static async abortAll() {
        for(let key of this.votings.keys()) {
            this.votings.get(key)?.abort()
        }
    }
}

export namespace VoteHandler {

    export class Voting {
        public readonly channelUUID: string
        public readonly category: VoteCategory
        public readonly votes: Map<string, Vote> = new Map()
        private state: VotingState = VotingState.STATE_INIT

        private timeout?: NodeJS.Timeout

        constructor(channelUUID: string, category: VoteCategory) {
            this.channelUUID = channelUUID
            this.category = category

            this.timeout = setTimeout(async() => {
                this.end()
            }, config.app.voting.duration * 1000)

            // Created event
            this.notifyDataChanged()

            // Set state to pending
            this.state = VotingState.STATE_PENDING
        }

        public getState(): VotingState {
            return this.state
        }

        /**
         * 
         * @param state 
         */
        public setState(state: VotingState) {
            this.state = state
            this.notifyDataChanged()
        }

        /**
         * Add a vote from a member
         * @param memberId Member's id
         * @param value Value of the vote
         */
        public addVote(memberId: string, value: any) {
            this.votes.set(memberId, new Vote(memberId, value))
            this.notifyDataChanged()

            if(this.category == VoteCategory.CATEGORY_SKIP && this.isSkipSuccess()) {
                SocketHandler.getInstance().broadcastToStreamer(SocketEvents.EVENT_TRACK_SKIP, new PacketOutChannelSkip(this.channelUUID))
            }
        }

        /**
         * Remove vote from member
         * @param memberId Member's id
         */
        public removeVote(memberId: string) {
            this.votes.delete(memberId)
            this.notifyDataChanged()
        }

        /**
         * Abort the voting
         */
        public abort() {
            clearTimeout(this.timeout)
            this.timeout = undefined
            this.setState(VotingState.STATE_ABORTED)
            VoteHandler.setCooldown(this.channelUUID, config.app.voting.cooldown)
        }

        /**
         * End the voting
         */
        public end() {
            clearTimeout(this.timeout)
            this.timeout = undefined
            this.setState(VotingState.STATE_ENDED)

            if(this.category == VoteCategory.CATEGORY_SKIP && this.isSkipSuccess()) {
                SocketHandler.getInstance().broadcastToStreamer(SocketEvents.EVENT_TRACK_SKIP, new PacketOutChannelSkip(this.channelUUID))
            }
        }

        /**
         * Sort values by amount of same votes
         * @returns Map<string, number>
         */
        private sortByAmount(): Map<string, number> {
            var values: Map<string, number> = new Map()
            for(let key of this.votes.keys()){
                var valueString = (this.votes.get(key).value).toString()
                var currentAmount = values.get(key) || 0

                values.set(valueString, currentAmount + 1)
            }

            return values
        }

        /**
         * Notify all connected clients about new results
         */
        public async notifyDataChanged() {
            var values = this.sortByAmount()
            var endsAt = new Date((Date.now() + config.app.voting.duration * 1000))
            SocketHandler.getInstance().broadcastToRoom('channel-' + this.channelUUID, SocketEvents.EVENT_CHANNEL_VOTING, new PacketOutChannelVoting(this.channelUUID, this.category, values, this.state, endsAt))
        }

        /**
         * Check if (when category is skip) vote was successfull
         */
        private isSkipSuccess(): Boolean {
            var values = this.sortByAmount()

            if(this.state == VotingState.STATE_ENDED) {
                return values.get("true") > values.get("false")
            } else {
                var listeners = ChannelHandler.getChannel(this.channelUUID).listeners
                var yesVotes = values.get("true")
                return (yesVotes / listeners) >= 0.5
            }
        }
    }

    export class Vote {
        public readonly memberId: string
        public readonly value: any

        constructor(memberId: string, value: any) {
            this.memberId = memberId
            this.value = value
        }
    }

    export enum VoteCategory {
        CATEGORY_SKIP = 0
    }

    export enum VotingState {
        STATE_INIT = 0,
        STATE_PENDING,
        STATE_ABORTED,
        STATE_ENDED
    }

}
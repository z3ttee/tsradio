import { Channel } from "../models/channel";
import PacketOutChannelAdd from "../packets/PacketOutChannelAdd";
import PacketOutChannelDelete from "../packets/PacketOutChannelDelete";
import PacketOutChannelHistory from "../packets/PacketOutChannelHistory";
import PacketOutChannelInfo from "../packets/PacketOutChannelInfo";
import { SocketClient } from "../sockets/socketClient";
import { SocketEvents } from "../sockets/socketEvents";
import { SocketHandler } from "../sockets/socketHandler";
import { VoteHandler } from "./voteHandler";

export default class ChannelHandler {

    public static readonly channels: Map<string, Channel> = new Map()

    /**
     * Load all channels from the database
     */
    public static async loadChannels() {
        let channels = await Channel.findAll()
        if(channels) {
            for(let channel of channels) {
                this.channels[channel.uuid] = channel
            }
        }
    }

    /**
     * Register a single channel
     * @param channel Channel to register
     */
    public static registerChannel(channel: Channel) {
        this.channels[channel.uuid] = channel
    }

    /**
     * Unregister a single channel
     * @param uuid Channel's uuid 
     */
    public static unregisterChannel(uuid: string) {
        this.channels[uuid] = undefined
        VoteHandler.abort(uuid)
    }

    /**
     * Update a registered channel
     * @param channel Channel to update
     */
    public static updateRegisteredChannel(channel: Channel) {
        if(!this.isRegistered(channel.uuid)) {
            return
        }

        const old = this.getChannel(channel.uuid)
        old.title = channel.title
        old.description = channel.description
        old.enabled = channel.enabled
        old.featured = channel.featured
        old.lyricsEnabled = channel.lyricsEnabled
        old.colorHex = channel.colorHex
        old.creatorId = channel.creatorId

        return this.registerChannel(old)
    }

    /**
     * Update channel's state. Sends Channel Deletion or Add to listeners
     * @param channelId Channel's id
     * @param state Updated state
     */
    public static updateState(channelId: string, state: Channel.ChannelState) {
        if(!this.isRegistered(channelId)) return

        const channel = this.getChannel(channelId)
        channel.channelState = state

        if(state != Channel.ChannelState.STATE_STREAMING) {
            channel.update({ activeSince: null })
            SocketHandler.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_DELETE, new PacketOutChannelDelete(channelId))
        } else {
            channel.update({ activeSince: Date.now() })
            SocketHandler.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_DELETE, new PacketOutChannelAdd(channelId))
        }
    }

    /**
     * Check if a channel is registered
     * @param channelId Channel's uuid
     */
    public static isRegistered(channelId: string): Boolean {
        return !!this.channels[channelId]
    }

    /**
     * Get registered channel by id
     * @param channelId Channel's id
     */
    public static getChannel(channelId: string): Channel {
        return this.channels[channelId]
    }

    /**
     * Clear channel's info
     * @param channelId Channel's uuid
     */
    public static clearChannelInfo(channelId: string) {
        if(!this.isRegistered(channelId)) return

        this.getChannel(channelId).channelInfo = undefined
    }

    /**
     * Clear channel's history
     * @param channelId Channel's uuid
     */
    public static clearChannelHistory(channelId: string) {
        if(!this.isRegistered(channelId)) return

        this.getChannel(channelId).channelHistory = undefined
    }

    /**
     * Check if a channel is streaming
     * @param channelId Channel's uuid
     */
    public static isStreaming(channelId: string): Boolean {
        if(!this.isRegistered(channelId)) return false;
        return this.getChannel(channelId).channelState == Channel.ChannelState.STATE_STREAMING
    }

    /**
     * Set channel history
     * @param channelId Channel's uuid
     * @param history Channel's history
     */
    public static setChannelHistory(channelId: string, history) {
        if(!this.isRegistered(channelId)) return
        this.getChannel(channelId).channelHistory = history
        SocketHandler.getInstance().broadcastToRoom("channel-" + channelId, SocketEvents.EVENT_CHANNEL_HISTORY, new PacketOutChannelHistory(channelId, history))
    }

    /**
     * Set channel info
     * @param channelId Channel's uuid 
     * @param channelInfo Channel's history
     */
    public static setChannelInfo(channelId: string, channelInfo) {
        if(!this.isRegistered(channelId)) return
        this.getChannel(channelId).channelInfo = channelInfo
        SocketHandler.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_INFO, new PacketOutChannelInfo(channelId, channelInfo.title, channelInfo.artist, channelInfo.timestamp.toString()))
    }

    /**
     * Clear history and channel info of every channel. Used when streamer disconnects from socket
     */
    public static resetAllChannels() {
        Object.keys(this.channels).forEach((key) => {
            this.clearChannelHistory(key)
            this.clearChannelInfo(key)
            this.updateState(key, Channel.ChannelState.STATE_OFFLINE)
            VoteHandler.abortAll()
        })
    }

    /**
     * Move a member to another channel
     * @param member Member
     * @param channelId Destination channel id
     */
    public static moveMemberToChannel(member: SocketClient.SocketMember, destChannelId?: string) {
        const currentChannel = member.getCurrentChannel()
        const destChannel = ChannelHandler.getChannel(destChannelId)

        currentChannel?.decreaseListeners()
        destChannel?.increaseListeners()

        VoteHandler.removeVote(currentChannel?.uuid, member.profile.uuid)

        member.setCurrentChannel(destChannel)
    }

    /**
     * Remove member from listener list and reduce listener count from current channel
     * @param memberId Member's id
     */
    public static removeMember(member: SocketClient.SocketMember) {
        this.moveMemberToChannel(member, undefined)
    }

}
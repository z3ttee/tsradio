import { Channel } from "../models/channel";

export default class ChannelHandler {

    public static readonly channels: Map<string, Channel> = new Map()

    /**
     * Load all channels from the database
     */
    public static async loadChannels() {
        let channels = await Channel.findAll()
        console.log(channels)
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
    }

    /**
     * Update a registered channel
     * @param channel Channel to update
     */
    public static updateRegisteredChannel(channel: Channel) {
        return this.registerChannel(channel)
    }

}
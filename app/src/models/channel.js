import { Api, ResultSet, ResultSingleton } from '@/models/api'
import store from '@/store'
import { Socket } from '@/socket/socket'

export class Channel {

    /**
     * Load all channels
     */
    static async loadAll() {
        let result = await Api.getInstance().get('/channels')

        if(result instanceof ResultSet) {
            for(const channel of result.entries)
            this.setChannel(channel)
        }
    }

    /**
     * Unload all channels
     */
    static async unloadAll() {
        store.state.channels = {}
        store.state.activeChannel = undefined
    }

    /**
     * Unload specific channel
     * @param {*} channelId Channel's id
     */
    static async unload(channelId) {
        if(store.state.channels[channelId]) {
            store.state.channels[channelId] = undefined
            
            if(this.isActive(channelId)) {
                store.state.activeChannel = undefined
            }
        }
    }

    /**
     * Load a channel by id
     * @param {*} channelId Channel's id 
     */
    static async load(channelId) {
        let result = await Api.getInstance().get('/channels/' + channelId)

        if(result instanceof ResultSingleton) {
            this.setChannel(result.data)
        }
    }

    /**
     * Reset history of a channel
     * @param {*} channelId Channel's id
     */
    static async resetHistory(channelId) {
        if(store.state.channels[channelId]) {
            delete store.state.channels[channelId].history
        }
    }

    /**
     * 
     * @param {*} channelData 
     */
    static async setChannel(channelData) {
        if(store.state.channels[channelData.uuid]) {
            store.state.channels[channelData.uuid] = {
                ...store.state.channels[channelData.uuid],
                ...channelData
            }
        } else {
            store.state.channels[channelData.uuid] = channelData
        }
    }

    /**
     * Set channel's metadata
     * @param {*} uuid Channel's uuid
     * @param {*} infoData Updated metadata
     */
    static async setChannelInfo(uuid, infoData) {
        if(store.state.channels[uuid]) {
            store.state.channels[uuid].info = infoData
        }
    }

    /**
     * Set a channel's history
     * @param {*} uuid Channel's id
     * @param {*} history Channel's history
     */
    static async setChannelHistory(uuid, history) {
        if(store.state.channels[uuid]) {
            store.state.channels[uuid].history = history
        }
    }

    /**
     * Set a channel's listener count
     * @param {*} uuid Channel's uuid
     * @param {*} listeners Listener count
     */
    static async setListeners(uuid, listeners) {
        if(store.state.channels[uuid]) {
            store.state.channels[uuid].listeners = listeners
        }
    }

    /**
     * Set a channel's pending voting
     * @param {*} uuid Channel's uuid
     * @param {*} voting Voting's data
     */
    static async setVoting(uuid, voting) {
        if(store.state.channels[uuid]) {
            store.state.channels[uuid].voting = voting
        }
    }

    /**
     * Check if a channel's id matches the id of the channel a user listens to
     * @param {*} channelId Channel's id
     * @returns True or False
     */
    static isActive(channelId) {
        return store.state.activeChannel?.uuid == channelId
    }

    /**
     * Select a channel
     * @param {*} channelId Channel's id
     */
    static select(channelId) {
        if(this.isActive(channelId)) return

        store.state.activeChannel = store.state.channels[channelId]
        Socket.subscribeChannel(channelId)
    }

}
import store from '@/store/index.js'
import apijs from '@/models/api.js'
//import socket from './socket'

class Channel {

    async remove(channelUUID) {
        delete store.state.channels[channelUUID]
    }

    async setChannel(channelUUID, data) {
        let currentChannel = store.state.currentChannel

        if(!data) {
            delete store.state.channels[channelUUID]
            if(currentChannel && currentChannel.uuid == channelUUID) {
                store.state.currentChannel = undefined
            }
            return
        }
        
        store.state.channels[channelUUID] = data
    }

    async initSkip(channelUUID) {
        return apijs.get('/channels/'+channelUUID+'/skip')
        //socket.emit(socket.CHANNEL_SKIP, {uuid: channelUUID})
    }

    async onChannelSkipListener(data) {
        console.log(data)
    }

    async updateMetadata(channelUUID, data) {
        let channel = store.state.channels[channelUUID]
        let currentChannel = store.state.currentChannel

        if(channel) {
            let updatedInfo = {
                title: data.title,
                artist: data.artist
            }
            channel.info = updatedInfo
            store.state.channels[channelUUID] = channel

            if(currentChannel && currentChannel.uuid == channelUUID) {
                currentChannel.info = updatedInfo
            }
        }
    }
    async updateStatus(channelUUID, data) {
        let channel = store.state.channels[channelUUID]
        let currentChannel = store.state.currentChannel

        if(!channel) {
            // Register channel if it does not exist
            return await this.setChannel(channelUUID, data)
        }

        if(!data.active) {
            // Remove channel if it is not active anymore
            return await this.setChannel(channelUUID, undefined)
        }

        channel.active = data.active
        channel.title = data.title
        channel.description = data.description
        channel.featured = data.featured
        channel.listeners = data.listeners
        channel.special = data.special

        if(currentChannel && currentChannel.uuid == channelUUID) {
            store.state.currentChannel.active = data.active
            store.state.currentChannel.title = data.title
            store.state.currentChannel.description = data.description
            store.state.currentChannel.featured = data.featured
            store.state.currentChannel.listeners = data.listeners
            store.state.currentChannel.special = data.special
        }
    }

    async moveListener(destinationUUID, previousUUID) {
        let prevChannel = store.state.channels[previousUUID]
        let destChannel = store.state.channels[destinationUUID]

        if(destChannel) {
            if(!prevChannel) {
                // If user has not listened to channel before during current session, add one to destination channel
                destChannel.listeners += 1
            } else {
                // If user has listened to channel before, remove one from prev and add one to dest
                if(prevChannel.listeners >= 1) prevChannel.listeners -= 1
                destChannel.listeners += 1
            }
        } else {
            // No destChannel means disconnect
            if(prevChannel) {
                if(prevChannel.listeners >= 1) prevChannel.listeners -= 1
            }
        }

        let currentChannel = store.state.currentChannel
        if(currentChannel) {
            if(currentChannel.uuid == destinationUUID) {
                currentChannel.listeners = destChannel.listeners
            }
            if(currentChannel.uuid == previousUUID) {
                currentChannel.listeners = prevChannel.listeners
            }
        }
    }

    async getHistory(channelUUID) {
        let result = await apijs.get('/channels/'+channelUUID+'/history')
        return result
    }
    async getLyrics(title, artist) {
        let result = await apijs.post('/songs/lyrics', {
            title, artist
        })
        return result
    }

    async clearAll() {
        store.state.channels = {}
        store.state.currentChannel = undefined
    }

}

export default new Channel()
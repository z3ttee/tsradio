import store from '@/store/index.js'

class Channel {

    async remove(channelUUID) {
        delete store.state.channels[channelUUID]
    }

    async setChannel(channelUUID, data) {
        store.state.channels[channelUUID] = data

        let currentChannel = store.state.currentChannel
        if(currentChannel && currentChannel.uuid == data.uuid) {
            if(currentChannel.title != data.title) currentChannel.title = data.title
            if(currentChannel.path != data.path) currentChannel.path = data.path
            if(currentChannel.info != data.info) currentChannel.info = data.info
            if(currentChannel.listeners != data.listeners) currentChannel.listeners = data.listeners
        }
    }

    async update(channelUUID, data) {
        let channel = store.state.channels[channelUUID]

        if(!channel) {
            return await this.setChannel(channelUUID, data)
        }

        this.setChannel(channelUUID, data)
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
                prevChannel.listeners -= 1
                destChannel.listeners += 1
            }
        } else {
            // No destChannel means disconnect
            if(prevChannel) {
                prevChannel.listeners -= 1
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

    async clearAll() {
        store.state.channels = {}
        store.state.currentChannel = undefined
    }

}

export default new Channel()
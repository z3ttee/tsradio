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
        }
    }

    async update(channelUUID, data) {
        let channel = store.state.channels[channelUUID]

        if(!channel) {
            return await this.setChannel(channelUUID, data)
        }

        this.setChannel(channelUUID, data)
    }

    async clearAll() {
        store.state.channels = {}
        store.state.currentChannel = undefined
    }

}

export default new Channel()
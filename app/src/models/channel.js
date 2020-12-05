import store from '@/store/index.js'

class Channel {

    async remove(channelUUID) {
        store.state.channels[channelUUID] = undefined
    }

    async setChannel(channelUUID, data) {
        store.state.channels[channelUUID] = data
    }

    async update(channelUUID, data) {
        let channel = store.state.channels[channelUUID]

        if(!channel) {
            return await this.setChannel(channelUUID, data)
        }

        this.setChannel(channelUUID, data)
    }

}

export default new Channel()
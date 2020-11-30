import api from '@/models/api.js'
import store from '../store'

class Channel {

    async findOne(channelID) {
        let result = await api.get('/channels/'+channelID)

        if(result.status != 200) {
            return undefined
        } else {
            return result.data
        }
    }

    async updateChannel(data){
        let channelID = data.uuid
        let channel = store.state.channels[channelID]

        if(!channel){
            channel = await this.findOne(channelID)
            if(!channel) return
        }

        channel.info = {}
        channel = {...channel, ...data.data}
        let isActive = data.active ?? true
        
        if(isActive) {
            store.state.channels[channelID] = channel
        } else {
            store.state.channels[channelID] = undefined
        }        
    }

}

export default new Channel()
import redis from 'redis'
import config from '../config/config.js'

const CHANNEL_STATUS_UPDATE = "channel_update_status"
const CHANNEL_UPDATE_METADATA = "channel_update_metadata"



class RedisClient {
    constructor(){
        this.subscriber = redis.createClient({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.pass
        })
        this.publisher = redis.createClient({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.pass
        })

        this.subscriber.on("message", (channel, message) => this.handleMessage(channel, message))
        this.subscriber.subscribe(CHANNEL_STATUS_UPDATE)
        this.subscriber.subscribe(CHANNEL_UPDATE_METADATA)
    }

    on(event, callback) {
        this.subscriber.on(event, callback)
    }

    handleMessage(channel, message) {
        switch (channel) {
            case CHANNEL_STATUS_UPDATE:
                this.onChannelStatusUpdate(message)
                break
            case CHANNEL_UPDATE_METADATA:
                this.onChannelMetadataUpdate(message)
                break
            default:
                break
        }
    }

    onChannelStatusUpdate(data) {
        console.log(JSON.parse(data))
    }
    onChannelMetadataUpdate(data) {
        console.log(JSON.parse(data))
    }
}



export default new RedisClient()
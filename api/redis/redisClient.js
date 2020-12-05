import redis from 'redis'
import config from '../config/config.js'
import { Channel } from '../models/channel.js'
import Socket from '../models/socket.js'

class RedisClient {
    CHANNEL_CREATED = "channel_created"
    CHANNEL_DELETED = "channel_deleted"
    CHANNEL_STATUS_UPDATE = "channel_update_status"
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"

    constructor(){
        this.subscriber = redis.createClient({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.pass
        })
        this.reader = redis.createClient({
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
        this.subscriber.subscribe(this.CHANNEL_STATUS_UPDATE)
        this.subscriber.subscribe(this.CHANNEL_UPDATE_METADATA)
    }

    on(event, callback) {
        this.subscriber.on(event, callback)
    }

    broadcast(channel, message) {
        this.publisher.publish(channel, message)
    }

    handleMessage(channel, message) {
        switch (channel) {
            case this.CHANNEL_STATUS_UPDATE:
                this.onChannelStatusUpdate(message)
                break
            case this.CHANNEL_UPDATE_METADATA:
                this.onChannelMetadataUpdate(message)
                break
            default:
                break
        }
    }

    onChannelStatusUpdate(data) {
        let json = JSON.parse(data)
        if(!json.active) Channel.setInactive(json.uuid)

        Socket.broadcast(this.CHANNEL_STATUS_UPDATE, json)
    }
    onChannelMetadataUpdate(data) {
        let json = JSON.parse(data)

        console.log(json)
        
        let channel = Channel.update(json.uuid, json)

        Socket.broadcast(this.CHANNEL_UPDATE_METADATA, channel)
    }
}



export default new RedisClient()
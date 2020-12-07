import redis from 'redis'
import config from '../config/config.js'
import { Channel } from '../models/channel.js'
import Socket from '../models/socket.js'

class RedisClient {
    CHANNEL_CREATED = "channel_created"
    CHANNEL_DELETED = "channel_deleted"
    CHANNEL_STATUS_UPDATE = "channel_update_status"
    CHANNEL_PING = "channel_ping"
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"

    constructor(){
        this.subscriber = redis.createClient({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.pass
        })
        this.client = redis.createClient({
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
        this.subscriber.subscribe(this.CHANNEL_PING)
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
            case this.CHANNEL_PING: 
                this.onChannelPing(message)
                break
            default:
                break
        }
    }

    onChannelStatusUpdate(data) {
        try {
            let json = JSON.parse(data)
            if(!json.active) Channel.setInactive(json.uuid)
            Socket.broadcast(this.CHANNEL_STATUS_UPDATE, json)
        } catch (error) {
            console.log(error)
        }
    }
    onChannelMetadataUpdate(data) {
        try {
            let json = JSON.parse(data)
            let channel = Channel.update(json.uuid, json)
            Socket.broadcast(this.CHANNEL_UPDATE_METADATA, channel)
        } catch (error) {
            console.log(error)
        }
    }
    onChannelPing(data) {
        try {
            let json = JSON.parse(data)
            Channel.setPingTime(json.uuid)
        } catch (error) {
            console.log(error)
        }
    }
}

export default new RedisClient()
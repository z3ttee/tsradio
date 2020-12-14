import redis from 'redis'
import config from '../config/config.js'
import { Channel } from '../models/channel.js'
import Socket from '../models/socket.js'

class RedisClient {
    CHANNEL_CREATED = "channel_created"
    CHANNEL_DELETED = "channel_deleted"
    CHANNEL_SKIP = "channel_skipped"
    CHANNEL_UPDATE_STATUS = "channel_update_status"
    CHANNEL_PING = "channel_ping"
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"
    CHANNEL_UPDATE_HISTORY = "channel_update_history"

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
        this.subscriber.subscribe(this.CHANNEL_UPDATE_STATUS)
        this.subscriber.subscribe(this.CHANNEL_UPDATE_HISTORY)
        this.subscriber.subscribe(this.CHANNEL_UPDATE_METADATA)
        this.subscriber.subscribe(this.CHANNEL_PING)

        this.client.on('error', () => {})
        this.publisher.on('error', () => {})
    }

    on(event, callback) {
        this.subscriber.on(event, callback)
    }

    broadcast(channel, message) {
        this.publisher.publish(channel, message)
    }

    handleMessage(channel, message) {
        switch (channel) {
            case this.CHANNEL_UPDATE_STATUS:
                this.onChannelUpdateStatus(message)
                break
            case this.CHANNEL_UPDATE_METADATA:
                this.onChannelUpdateMetadata(message)
                break
            case this.CHANNEL_PING: 
                this.onChannelPing(message)
                break
            default:
                break
        }
    }

    onChannelUpdateStatus(data) {
        try {
            let parsedData = JSON.parse(data)
            let updatedData = Channel.updateStatus(parsedData.uuid, parsedData)
            Socket.broadcast(this.CHANNEL_UPDATE_STATUS, updatedData)
        } catch (error) {
            console.log(error)
        }
    }
    onChannelUpdateMetadata(data) {
        try {
            let parsedData = JSON.parse(data)
            let updatedData = Channel.updateMetadata(parsedData.uuid, parsedData)
            Socket.broadcast(this.CHANNEL_UPDATE_METADATA, updatedData)
        } catch (error) {
            console.log(error)
        }
    }
    /*onChannelHistoryUpdate(data) {
        try {
            let json = JSON.parse(data)
            let channel = Channel.update(json.uuid, json)
            Socket.broadcast(this.CHANNEL_UPDATE_METADATA, channel)
        } catch (error) {
            console.log(error)
        }
    }*/
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
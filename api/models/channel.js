import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import redis from '../redis/redisClient.js'
import Socket from '../models/socket.js'

class Channel extends Model {
    static SET_CHANNELS = "set_active_channels"

    static activeChannels = {}
    static lastPingTimes = {}

    static setupInterval() {
        let interval = () => {
            Object.keys(this.lastPingTimes).forEach((key) => {
                let timestamp = this.lastPingTimes[key]
                let diff = Date.now()-timestamp
                let maxDiffAllowed = 1000*5             // 5 sec

                if(diff > maxDiffAllowed) {
                    console.log("Found zombie channel: "+key)
                    this.removeZombieChannel(key)
                }
                
            })
        }
        
        setInterval(interval, 1000)
    }

    static setInactive(channelUUID) {
        this.update(channelUUID, undefined)
    }

    static setChannel(channelUUID, data) {
        if(!data) {
            delete this.lastPingTimes[channelUUID]
            this.removePing(channelUUID)
        } else {
            this.activeChannels[channelUUID] = data
        }
    }

    static update(channelUUID, data) {
        this.setChannel(channelUUID, data)
        return this.activeChannels[channelUUID]
    }

    static loadActiveChannels() {
        redis.client.hgetall(this.SET_CHANNELS, (err, res) => {
            if(!res) return

            Object.keys(res).forEach((key) => {
                let channel = res[key]
                
                try {
                    channel = JSON.parse(channel)
                    this.setChannel(channel.uuid, channel)
                } catch (error) {  }
            })
        })
    }

    static setPingTime(channelUUID) {
        this.lastPingTimes[channelUUID] = Date.now()
    }
    static removePing(channelUUID) {
        delete this.lastPingTimes[channelUUID]
    }
    static removeZombieChannel(channelUUID) {
        this.update(channelUUID, undefined)
        redis.client.hdel(this.SET_CHANNELS, channelUUID)
        Socket.broadcast(redis.CHANNEL_STATUS_UPDATE, { uuid: channelUUID, active: false})

        console.log("Zombie channel "+channelUUID+" removed.")
    }

}

const dbModel = {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'channels',
    timestamps: true,
    updatedAt: true
}

export { Channel, dbModel, dbSettings }
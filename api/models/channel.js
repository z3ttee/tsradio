import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import redis from '../redis/redisClient.js'

class Channel extends Model {

    static activeChannels = {}

    static setInactive(channelUUID) {
        this.update(channelUUID, undefined)
    }

    static setChannel(channelUUID, data) {
        this.activeChannels[channelUUID] = data
    }
    static update(channelUUID, data) {
        this.setChannel(channelUUID, data)
        return this.activeChannels[channelUUID]
    }

    static loadActiveChannels() {
        redis.reader.hgetall("set_active_channels", (err, res) => {
            Object.keys(res).forEach((key) => {
                let channel = res[key]
                
                try {
                    channel = JSON.parse(channel)
                    this.setChannel(channel.uuid, channel)
                } catch (error) {  }
            })
        })
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
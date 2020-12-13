import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import redis from '../redis/redisClient.js'
import Socket from '../models/socket.js'
import { TrustedError } from '../error/trustedError.js'

class Channel extends Model {
    static MAP_CHANNEL_STATUS = "map_channel_status"
    static MAP_CHANNEL_METADATA = "map_channel_metadata"
    static MAP_CHANNEL_HISTORY = "map_channel_history"

    static activeChannels = {}
    static lastPingTimes = {}
    static listeners = {}
    static activeVotings = {}

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

    static get(channelUUID) {
        return this.activeChannels[channelUUID]
    }

    static setInactive(channelUUID) {
        this.setChannel(channelUUID, undefined)
    }

    static setChannel(channelUUID, data) {
        if(!data) {
            this.removeChannel(channel)
            return null
        } else {
            // Preserve current listener count
            let channel = this.activeChannels[channelUUID]
            let listeners = 0

            if(channel) {
                listeners = channel.listeners
            }

            data.listeners = listeners
            this.activeChannels[channelUUID] = data
            return this.activeChannels[channelUUID]
        }
    }

    static updateStatus(channelUUID, data) {
        let channel = this.activeChannels[channelUUID]
        if(!channel) {
            if(data.active) {
                data.listeners = 0
                this.activeChannels[channelUUID] = data
                return data
            }
            return data
        }

        if(!data.active) {
            this.setInactive(channelUUID)
            return data
        }

        channel.active = data.active
        channel.title = data.title
        channel.description = data.description
        channel.featured = data.featured
        channel.special = data.special
        // channel.uuid and channel.path is not updated, because this action is not allowed

        this.activeChannels[channelUUID] = channel
        return this.activeChannels[channelUUID]
    }
    static updateMetadata(channelUUID, data) {
        let channel = this.activeChannels[channelUUID]
        if(!channel) return

        channel.info = {
            title: data.title,
            artist: data.artist
        }

        this.activeChannels[channelUUID] = channel
        return data
    }

    static async loadChannels() {
        let statuses = await this.loadMap(this.MAP_CHANNEL_STATUS)
        let metadatas = await this.loadMap(this.MAP_CHANNEL_METADATA)
        //let histories = this.loadActiveHistories()

        Object.values(statuses).forEach((activeChannel) => {
            let status = activeChannel
            let metadata = metadatas[activeChannel.uuid]

            //let history = histories[activeChannel.uuid]

            let channel = {
                uuid: status.uuid,
                active: status.active,
                title: status.title,
                description: status.description,
                path: status.path,
                featured: status.featured,
                special: status.special || false,
                info: {
                    title: metadata.title || undefined,
                    artist: metadata.artist || undefined,
                    //history: history.history
                },
                listeners: 0
            }

            this.setChannel(status.uuid, channel)
        })
    }

    static async loadMap(mapname) {
        return new Promise((resolve, reject) => {
            let entries = {}

            redis.client.hgetall(mapname, (err, res) => {
                if(!res) {
                    resolve({})
                    return
                }

                Object.keys(res).forEach((key) => {
                    let entry = res[key]
                    
                    try {
                        entry = JSON.parse(entry)
                        entries[entry.uuid] = entry
                    } catch (error) {  }
                })

                resolve(entries)
            })
        })
    }

    static initSkip(channelUUID, userUUID){
        let clientSocket = Socket.getClient(userUUID)
        
        if(this.activeVotings[channelUUID]) {
            return TrustedError.get("API_CHANNEL_VOTE_ACTIVE")
        }

        let createdAt = Date.now()
        let expiresAt = createdAt + (31 * 1000)

        let expiryManager = setTimeout(() => {
            this.endVoting(channelUUID, false)
        }, 31*1000)

        this.activeVotings[channelUUID] = {
            createdAt,
            expiresAt,
            voters: [userUUID],
            expiryManager
        }

        console.log("Vote has been initiated for channel "+channelUUID)
        clientSocket.join("channel-"+channelUUID)
        Socket.broadcastToRoom("channel-"+channelUUID, "skip", {
            status: 'init',
            createdAt,
            expiresAt,
            votes: 1
        })

        this.checkVotePassed(channelUUID)
        return {}
    }
    static addVote(channelUUID, userUUID){
        if(this.hasPendingVoting(channelUUID)) {
            let voting = this.getVoting(channelUUID)

            if(!voting.voters.includes(channelUUID)) {
                this.activeVotings[channelUUID].voters.push(userUUID)
            }
            
            this.checkVotePassed(channelUUID)
        }
        return {}
    }
    static removeVote(channelUUID, userUUID){
        if(this.hasPendingVoting(channelUUID)) {
            let voting = this.getVoting(channelUUID)
            let index = voting.voters.indexOf(userUUID)

            this.activeVotings[channelUUID].voters.splice(index, 1)
            this.checkVotePassed(channelUUID)
        }
        return {}
    }
    static checkVotePassed(channelUUID) {
        if(!this.activeChannels[channelUUID] || !this.activeVotings[channelUUID]) {
            return
        }

        let listenerCount = this.activeChannels[channelUUID].listeners
        let votes = this.activeVotings[channelUUID].voters.length
        let percentage = 0.0

        if(listenerCount <= 0){
            percentage = 1.0
        } else {
            percentage = votes/listenerCount
        }

        if(percentage > 0.5) {
            console.log("voting passed: "+percentage)
            this.endVoting(channelUUID, true)
        }
    }

    static endVoting(channelUUID, success) {
        let voting = this.activeVotings[channelUUID]
        if(!voting) return

        if(success) {
            // Send to streamer
            redis.broadcast(redis.CHANNEL_SKIP, JSON.stringify({uuid: channelUUID}))

            // Send to listeners
            Socket.broadcastToRoom("channel-"+channelUUID, "skip", { status: 'success' })
        } else {
            Socket.broadcastToRoom("channel-"+channelUUID, "skip", { status: 'failed' })
        }

        clearTimeout(voting.expiryManager)
        delete this.activeVotings[channelUUID]
    }
    static hasPendingVoting(channelUUID) {
        return !!this.activeVotings[channelUUID]
    }
    static getVoting(channelUUID) {
        return this.activeVotings[channelUUID]
    }

    static setPingTime(channelUUID) {
        this.lastPingTimes[channelUUID] = Date.now()
    }
    static removeZombieChannel(channelUUID) {
        console.log("Found zombie channel "+channelUUID+".")
        this.removeChannel(channelUUID)
    }
    static removeChannel(channelUUID) {
        delete this.lastPingTimes[channelUUID]
        delete this.activeChannels[channelUUID]
        this.endVoting(channelUUID, false)

        redis.client.hdel(this.MAP_CHANNEL_STATUS, channelUUID, () => {
            Socket.broadcast(redis.CHANNEL_UPDATE_STATUS, { uuid: channelUUID, active: false})
            console.log("Channel "+channelUUID+" removed.")

            redis.client.hdel(this.MAP_CHANNEL_METADATA, channelUUID, () => {})
            redis.client.hdel(this.MAP_CHANNEL_HISTORY, channelUUID, () => {})
        })
    }

    static async moveListenerTo(userUUID, destChannelUUID) {
        let prevChannelUUID = this.listeners[userUUID]
        let destChannel = this.activeChannels[destChannelUUID]

        if(destChannelUUID) {
            if(destChannel) {
                // Set new channel for listener if destination exists
                this.listeners[userUUID] = destChannel.uuid

                if(!prevChannelUUID) {
                    // If user has not listened to channel before during current session, add one to destination channel
                    this.activeChannels[destChannel.uuid].listeners += 1
                } else {
                    // If user has listened to channel before, remove one from prev and add one to dest
                    if(this.activeChannels[prevChannelUUID].listeners >= 1) this.activeChannels[prevChannelUUID].listeners -= 1
                    this.activeChannels[destChannel.uuid].listeners += 1

                    Socket.getClient(userUUID).leave(Socket.CHANNEL_UUID+prevChannelUUID)
                    this.removeVote(prevChannelUUID, userUUID)
                }

                this.checkVotePassed(prevChannelUUID)
                Socket.getClient(userUUID).join("channel-"+destChannelUUID)

                if(this.hasPendingVoting(destChannelUUID)) {
                    let voting = this.getVoting(channelUUID)
                    
                    Socket.getClient(userUUID).emit("skip", {
                        room: "channel-"+channelUUID,
                        status: 'init',
                        votes: voting.voters.length,
                        createdAt: voting.createdAt,
                        expiresAt: voting.expiresAt
                    })
                }
            }
        } else {
            // undefined destPath means disconnect
            if(prevChannelUUID) {
                Socket.getClient(userUUID).leave(Socket.CHANNEL_UUID+prevChannelUUID)
                this.removeVote(prevChannelUUID, userUUID)

                if(this.activeChannels[prevChannelUUID] && this.activeChannels[prevChannelUUID].listeners >= 1) {
                    this.activeChannels[prevChannelUUID].listeners -= 1
                }
            }
            delete this.listeners[userUUID]
        }

        // Broadcast change to clients
        Socket.broadcast(Socket.CHANNEL_UPDATE_LISTENER, {from: prevChannelUUID ? prevChannelUUID : undefined, to: destChannelUUID })
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
    },
    special: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'channels',
    timestamps: true,
    updatedAt: true
}

export { Channel, dbModel, dbSettings }
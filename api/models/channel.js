import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import redis from '../redis/redisClient.js'
import Socket from '../models/socket.js'

class Channel extends Model {
    static MAP_CHANNEL_STATUS = "map_channel_status"
    static MAP_CHANNEL_METADATA = "map_channel_metadata"
    static MAP_CHANNEL_HISTORY = "map_channel_history"

    static activeChannels = {}
    static lastPingTimes = {}
    static listeners = {}
    static activeVotes = {}

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
                info: {
                    title: metadata.title,
                    artist: metadata.artist,
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

    static skipOrInitSkip(channelUUID, userUUID) {
        if(!this.activeChannels[channelUUID]) return

        if(!this.activeVotes[channelUUID]) {
            let timeout = setTimeout(() => {
                if(this.activeVotes[channelUUID]) {
                    this.endVoting(channelUUID, true)
                }
            }, 31*1000) // Voting for 31s

            // Init skip voting
            this.activeVotes[channelUUID] = {
                voters: [userUUID],
                timeout
            }
            
            Socket.broadcast(Socket.CHANNEL_SKIP+channelUUID, { uuid: channelUUID, status: 'init', votes: this.activeVotes[channelUUID].voters.length })
        } else {
            // Add vote
            if(!this.activeVotes[channelUUID].voters.includes(userUUID)) {
                this.activeVotes[channelUUID].voters.push[userUUID]
                Socket.broadcast(Socket.CHANNEL_SKIP+channelUUID, { uuid: channelUUID, status: 'voting', votes: this.activeVotes[channelUUID].voters.length })
            }
        }

        let listeners = this.activeChannels[channelUUID].listeners
        let votes = this.activeVotes[channelUUID].voters.length
        let percentage = 0.0

        if(listeners <= 0) {
            percentage = 1.0
        } else {
            percentage = votes/listeners
        }

        console.log("votes for "+channelUUID+": "+this.activeVotes[channelUUID].voters.length)

        if(percentage > 0.5) {
            console.log("Voting succeeded: "+percentage)
            this.endVoting(channelUUID, false)
            return
        }
    }
    static endVoting(channelUUID, failed = false){
        let voting = this.activeVotes[channelUUID]

        if(voting) {
            clearTimeout(voting.timeout)

            if(!failed) {
                Socket.broadcast(Socket.CHANNEL_SKIP+channelUUID, { uuid: channelUUID, status: 'success', votes: this.activeVotes[channelUUID].voters.length })
                redis.broadcast(redis.CHANNEL_SKIP, { uuid: channelUUID })
            } else {
                Socket.broadcast(Socket.CHANNEL_SKIP+channelUUID, { uuid: channelUUID, status: 'failed', votes: this.activeVotes[channelUUID].voters.length })
            }
    
            delete this.activeVotes[channelUUID]
        }
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
        delete this.activeVotes[channelUUID]

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
                }
            }
        } else {
            // undefined destPath means disconnect
            if(prevChannelUUID) {
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
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'channels',
    timestamps: true,
    updatedAt: true
}

export { Channel, dbModel, dbSettings }
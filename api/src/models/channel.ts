import { Table, Model, Column, DataType, PrimaryKey, Unique } from 'sequelize-typescript'
import { Op } from 'sequelize'
import config from "../config/config"

import { randomBytes } from 'crypto'
import { Validator } from './validator'
import { TrustedError } from '../error/trustedError'
import { Endpoint } from '../endpoint/endpoint'
import { SocketHandler } from '../sockets/socketHandler'
import { SocketEvents } from '../sockets/socketEvents'
import PacketOutChannelUpdate from '../packets/PacketOutChannelUpdate'
import ChannelHandler from '../handler/channelHandler'
import PacketOutChannelDelete from '../packets/PacketOutChannelDelete'
import PacketOutChannelListeners from '../packets/PacketOutChannelListeners'
import { IcecastUtil } from '../utils/icecastUtil'

@Table({
    modelName: 'channel',
    tableName: config.mysql.prefix + "channels",
    timestamps: true
})
export class Channel extends Model {

    @PrimaryKey
    @Unique({
        name: "uuid",
        msg: ""
    })
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    public uuid: string

    @Unique({
        name: "mountpoint",
        msg: ""
    })
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    public mountpoint: string

    @Unique({
        name: "title",
        msg: ""
    })
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    public title: string

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    public description?: string

    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    public creatorId: string

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    public activeSince?: Date

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    public enabled: Boolean

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    public featured: Boolean

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
    public lyricsEnabled: Boolean

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "#fd6a6a"
    })
    public colorHex: string

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    public order: number

    public channelState: Channel.ChannelState = Channel.ChannelState.STATE_OFFLINE
    public channelInfo?: Channel.ChannelInfo
    public channelHistory?: Array<Channel.ChannelInfo>
    public listeners: number = 0

    /**
     * Decrease listener count by one
     */
    public decreaseListeners() {
        if(this.listeners >= 1) {
            this.listeners -= 1;
            SocketHandler.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_LISTENERS, new PacketOutChannelListeners(this.uuid, this.listeners))
        }
        console.log("Decrease: " + this.mountpoint + ": " + this.listeners)
    }

    /**
     * Increase listener count by one
     */
    public increaseListeners() {
        this.listeners += 1;
        SocketHandler.getInstance().broadcast(SocketEvents.EVENT_CHANNEL_LISTENERS, new PacketOutChannelListeners(this.uuid, this.listeners))
        console.log("Increase: " + this.mountpoint + ": " + this.listeners)
    }

    /**
     * Create new channel based on given data
     * @param title Title of channel
     * @param mountpoint Mountpoint in icecast
     * @param description Channel description
     * @param creatorId Creator of the channel
     * @param enabled Should the channel be enabled
     * @param featured Should the channel be featured
     * @param lyricsEnabled Should the channel search for lyrics
     * 
     * @returns Endpoint Result
     */
    static async createChannel(title: string, mountpoint: string, description: string, creatorId: string, enabled: Boolean, featured: Boolean, lyricsEnabled: Boolean, colorHex: string, order: number): Promise<Endpoint.Result> {
        // Validate data
        let validationResult = await Validator.validateChannelCreate({
            title, 
            mountpoint: (mountpoint ? mountpoint.replace("/", "").toLowerCase() : mountpoint), 
            description,
            creatorId
        })

        if(!validationResult.hasPassed()) {
            return validationResult.getError()
        }

        // Modify mountpoint: Remove slashes (front and end) and set front slash back for icecast compatability
        mountpoint = "/" + mountpoint?.replace("/", "").toLowerCase()

        if(!!colorHex) {
            if(!Validator.isHex(colorHex)) {
                return TrustedError.get(TrustedError.Errors.UNSUPPORTED_FORMAT)
            }
        }

        if(order) {
            if(order > 1000) {
                order = 1000
            }
            if(order < 0) {
                order = 0
            }
        }

        // Check if title or mountpoint exists
        let exists = await Channel.findOne({ 
            where: {
                [Op.or]: [
                    { title: title || "" },
                    { mountpoint: mountpoint || "" }
                ]
            }
        })
        if(exists) {
            return TrustedError.get(TrustedError.Errors.RESOURCE_EXISTS)
        }

        let channel = await Channel.create({
            title, 
            mountpoint, 
            description, 
            creatorId, 
            enabled, 
            featured, 
            lyricsEnabled,
            colorHex,
            order
        })

        if(!channel) {
            return TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
        } else {
            ChannelHandler.registerChannel(channel)
            IcecastUtil.addChannel(channel)
            SocketHandler.getInstance().broadcastToStreamer(SocketEvents.EVENT_CHANNEL_UPDATE, new PacketOutChannelUpdate(channel.uuid, channel.mountpoint, channel.enabled))
            return new Endpoint.ResultSingleton(200, channel)
        }
    }

    /**
     * Update a channel based on given data
     * @param targetUUID Channel's uuid 
     * @param data Channel's updated data
     * 
     * @returns Endpoint Result
     */
    static async updateChannel(targetUUID: string, data: Object): Promise<Endpoint.Result> {
        return new Promise<Endpoint.Result>(async(resolve) => {
            // Validate data
            let validationResult = await Validator.validateChannelUpdate({
                title: data?.["title"], 
                mountpoint: (data?.["mountpoint"] ? data?.["mountpoint"].replace("/", "") : undefined), 
                description: data?.["description"],
                creatorId: data?.["creatorId"]
            })

            if(!validationResult.hasPassed()) {
                resolve(validationResult.getError())
                return
            }

            if(!!data?.["colorHex"]) {
                if(!Validator.isHex(data?.["colorHex"])) {
                    resolve(TrustedError.get(TrustedError.Errors.UNSUPPORTED_FORMAT))
                    return
                }
            }
    
            if(!!data?.["order"]) {
                if(data["order"] > 1000) {
                    data["order"] = 1000
                }
                if(data["order"] < 0) {
                    data["order"] = 0
                }
            }

            // Modify mountpoint: Remove slashes (front and end) and set front slash back for icecast compatability
            let mountpoint = (data?.["mountpoint"] ? IcecastUtil.formatMountpoint(data?.["mountpoint"]) : undefined)
            let updatedData = {
                ...data,
                mountpoint
            }

            // Check if title or mountpoint exists
            let exists = await Channel.findOne({ 
                where: {
                    uuid: {
                        [Op.not]: targetUUID
                    },
                    [Op.or]: [
                        { title: data?.["title"] || "" },
                        { mountpoint: mountpoint || "" }
                    ]
                }
            })

            if(exists) {
                resolve(TrustedError.get(TrustedError.Errors.RESOURCE_EXISTS))
                return
            }

            Channel.findOne({ where: { uuid: targetUUID }}).then(async(result) => {
                if(result) {
                    var prevMountpoint = result.mountpoint
                    let updated = await result.update(updatedData)

                    if(updatedData) {
                        ChannelHandler.updateRegisteredChannel(updated)
                        IcecastUtil.updateChannel(prevMountpoint, updated)
                        SocketHandler.getInstance().broadcastToStreamer(SocketEvents.EVENT_CHANNEL_UPDATE, new PacketOutChannelUpdate(updated.uuid, updated.mountpoint, updated.enabled))
                        
                        resolve(new Endpoint.ResultSingleton(200, undefined))
                    } else {
                        resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
                    }
                } else {
                    resolve(TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND))
                }
                
            })
        })
        
    }

    /**
     * Delete a channel
     * @param targetUUID Channel's uuid 
     * 
     * @returns Endpoint Result
     */
    static async deleteChannel(targetUUID: string): Promise<Endpoint.Result> {
        let channel = await Channel.findOne({ where: { uuid: targetUUID || "" }, attributes: ['uuid', 'mountpoint']})
        if(!channel) return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)

        let affectedRows = await Channel.destroy({ 
            where: { uuid: targetUUID }
        })

        if(affectedRows == 0) {
            return TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
        } else {
            ChannelHandler.unregisterChannel(targetUUID)
            IcecastUtil.deleteChannel(channel?.mountpoint)
            SocketHandler.getInstance().broadcastToStreamer(SocketEvents.EVENT_CHANNEL_DELETE, new PacketOutChannelDelete(targetUUID))
            return new Endpoint.ResultSingleton(200, undefined)
        }
    }
}

export namespace Channel {
    export enum ChannelState {
        STATE_RUNNING = 0,
        STATE_STREAMING = 1,
        STATE_OFFLINE = 2,
        STATE_PREPARING = 3,
    }

    export class ChannelInfo {
        public title?: string
        public artist?: string
        public cover?: string
    }
}
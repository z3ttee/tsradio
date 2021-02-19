import { Table, Model, Column, DataType, PrimaryKey, Unique } from 'sequelize-typescript'
import { Op } from 'sequelize'
import config from "../config/config"

import { randomBytes } from 'crypto'
import { Validator } from './validator'
import { TrustedError } from '../error/trustedError'
import { Endpoint } from '../endpoint/endpoint'

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

    @Unique({
        name: "creatorId",
        msg: ""
    })
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

    @Unique({
        name: "coverHash",
        msg: ""
    })
    @Column({
        type: DataType.STRING(16),
        allowNull: true,
        defaultValue: () => {
            return randomBytes(8).toString('hex')
        }
    })
    public coverHash?: string

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
    public lyricsEnabled: Date

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "#fd6a6a"
    })
    public colorHex: string

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
    static async createChannel(title: string, mountpoint: string, description: string, creatorId: string, enabled: Boolean, featured: Boolean, lyricsEnabled: Boolean, colorHex: string): Promise<Endpoint.Result> {
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

        let channel = Channel.create({
            title, 
            mountpoint, 
            description, 
            creatorId, 
            enabled, 
            featured, 
            lyricsEnabled,
            colorHex
        })

        if(!channel) {
            return TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
        } else {
            // TODO: Send update to Redis for the streamer to recognize creation
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
        // Validate data
        let validationResult = await Validator.validateChannelUpdate({
            title: data?.["title"], 
            mountpoint: (data?.["mountpoint"] ? data?.["mountpoint"].replace("/", "") : undefined), 
            description: data?.["description"],
            creatorId: data?.["creatorId"]
        })

        if(!validationResult.hasPassed()) {
            return validationResult.getError()
        }

        if(!!data?.["colorHex"]) {
            if(!Validator.isHex(data?.["colorHex"])) {
                return TrustedError.get(TrustedError.Errors.UNSUPPORTED_FORMAT)
            }
        }

        // Modify mountpoint: Remove slashes (front and end) and set front slash back for icecast compatability
        let mountpoint = (data?.["mountpoint"] ? "/" + data?.["mountpoint"].replace("/", "").toLowerCase() : undefined)
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
            return TrustedError.get(TrustedError.Errors.RESOURCE_EXISTS)
        }

        let affectedRows = await Channel.update(updatedData, { where: { uuid: targetUUID }})[0]
        if(affectedRows == 0) {
            return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
        } else {
            // TODO: Send update to streamer
            return new Endpoint.ResultSingleton(200, undefined)
        }
    }
}
import { Table, Model, Column, DataType, PrimaryKey, Unique } from 'sequelize-typescript'
import { Op } from 'sequelize'
import config from "../config/config"

import { randomBytes } from 'crypto'
import { Validator } from './validator'
import { TrustedError } from '../error/trustedError'

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
     * @returns Channel or TrustedError
     */
    static async createChannel(title: string, mountpoint: string, description: string, creatorId: string, enabled: Boolean, featured: Boolean, lyricsEnabled: Boolean) {
        // Validate data
        let validationResult = await Validator.validateChannelCreate({
            title, 
            mountpoint: (mountpoint ? mountpoint.replace("/", "") : mountpoint), 
            description,
            creatorId
        })

        if(!validationResult.hasPassed()) {
            return validationResult.getError()
        }

        // Modify mountpoint: Remove slashes (front and end) and set front slash back for icecast compatability
        mountpoint = "/" + mountpoint?.replace("/", "").toLowerCase()

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
            lyricsEnabled
        })

        if(!channel) {
            return TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
        } else {
            // TODO: Send update to Redis for the streamer to recognize creation
            return channel
        }
    }
}
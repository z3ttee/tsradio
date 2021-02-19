import { Table, Model, Column, DataType, BelongsTo, ForeignKey, PrimaryKey, AfterFind, Index, CreatedAt, Unique } from 'sequelize-typescript'
import config from "../config/config"

import { Member } from "../account/member"
import { randomBytes } from 'crypto'

@Table({
    modelName: 'channel',
    tableName: config.mysql.prefix + "channels",
    timestamps: false
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
    public description: string

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
    public activeSince: Date

    @Column
    @CreatedAt
    public createdAt: Date

    @Unique({
        name: "coverHash",
        msg: ""
    })
    @Column({
        type: DataType.STRING(16),
        defaultValue: () => {
            return randomBytes(8).toString('hex')
        }
    })
    public coverHash: string

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    public enabled: Boolean

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    public featured: Boolean

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true
    })
    public lyricsEnabled: Date

    @AfterFind
    private static loadMemberProfile(member?: Member) {
        console.log(member)
    }
}
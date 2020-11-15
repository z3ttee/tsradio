import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import { Playlist } from './playlist.js'
import { User } from './user.js'

class Channel extends Model {}

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
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    playlist: {
        type: DataTypes.UUID,
        references: {
            model: Playlist,
            key: 'uuid'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },
    creatorUUID: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'uuid'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'channels',
    timestamps: true,
    updatedAt: true
}

export { Channel, dbModel, dbSettings }
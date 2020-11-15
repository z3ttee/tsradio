import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import { User } from './user.js'

class Playlist extends Model {}

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
    tracks: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'playlists',
    timestamps: true,
    updatedAt: true
}

export { Playlist, dbModel, dbSettings }
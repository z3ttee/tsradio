import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'
import { Playlist } from './playlist.js'
import { User } from './user.js'

class Track extends Model {}

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
        allowNull: true
    },
    artist: {
        type: DataTypes.STRING,
        allowNull: true
    },
    file: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'tracks',
    timestamps: true,
    updatedAt: true
}

export { Track, dbModel, dbSettings }
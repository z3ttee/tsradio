import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'

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
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'playlists_info',
    timestamps: true,
    updatedAt: true
}

export { Playlist, dbModel, dbSettings }
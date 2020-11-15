import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'

class TracksList extends Model {}

const dbModel = {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'playlists_tracks',
    timestamps: true,
    updatedAt: false
}

export { TracksList, dbModel, dbSettings }
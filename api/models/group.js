import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'

class Group extends Model {
}

const dbModel = {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    groupname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'groups',
    timestamps: true,
    updatedAt: false
}

export { Group, dbModel, dbSettings }
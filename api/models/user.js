import { Sequelize, Model, DataTypes } from 'sequelize'
import config from '../config/config.js'

class User extends Model {
    hasPermission(permission) {
        
    }
}

const dbModel = {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    groupUUID: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}

const dbSettings = {
    tableName: config.mysql.prefix+'users',
    timestamps: true,
    updatedAt: false
}

export { User, dbModel, dbSettings }
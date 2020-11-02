import { Sequelize,DataTypes } from 'sequelize'
import config from '../config/config'
import bcrypt from 'bcrypt'

class Database {
    constructor() {
        this.sequelize = new Sequelize('mysql://'+config.mysql.user+':'+config.mysql.pass+'@'+config.mysql.host+':'+config.mysql.port+'/'+config.mysql.dbname, {
            dialect: 'mysql',
            loggin: (...msg) => console.log(msg)
        })

        this.sequelize.authenticate()
            .then(() => {
                console.log('Connection has been established successfully.')

                // When connection successful, create tables
                createTables(this.sequelize)

            })
            .catch((error) => console.error('Unable to connect to the database:', error.message));
   
    }

    async findOne() {

    }
}

import User from '../models/user'

function createTables(sequelize) {
    console.log('Creating tables...')

    User.init({
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
        }
    }, {
        sequelize,
        tableName: config.mysql.prefix+'users',
        timestamps: true,
        updatedAt: false
    })
    
    User.sync({alter: true}).then(() => {
        // TODO: Create default user
        User.create({
            username: 'admin',
            password: bcrypt.hashSync('hackme', config.app.password_encryption.salt_rounds)
        })
    })
    
}

export default new Database()
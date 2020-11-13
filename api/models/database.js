import { DataTypes, Sequelize } from 'sequelize'
import config from '../config/config'
import bcrypt from 'bcrypt'

import { User, dbModel as userDBModel, dbSettings as userDBSettings} from '../models/user.js'
import { Group, dbModel as groupDBModel, dbSettings as groupDBSettings} from '../models/group.js'
import { Playlist, dbModel as playlistDBModel, dbSettings as playlistDBSettings} from '../models/playlist.js'


class Database {
    constructor() {
        this.sequelize = new Sequelize('mysql://'+config.mysql.user+':'+config.mysql.pass+'@'+config.mysql.host+':'+config.mysql.port+'/'+config.mysql.dbname, {
            dialect: 'mysql',
            logging: false
            //loggin: (...msg) => console.log(msg)
        })
    }

    setup() {
        this.sequelize.authenticate().then(() => {
            console.log('Connection has been established successfully.')

            // When connection successful, create tables
            createTables(this.sequelize)
        }).catch((error) => {
            console.error('Unable to connect to the database:', error.message)
        });
    }
}

async function createTables(sequelize) {
    console.log('Creating tables...')

    Playlist.init(playlistDBModel, {sequelize, ...playlistDBSettings})
    User.init(userDBModel, {sequelize, ...userDBSettings})
    Group.init(groupDBModel, {sequelize, ...groupDBSettings})

    User.belongsTo(Group, {
        as: 'Group',
        constraints: false,
        foreignKey: 'groupUUID'
    })

    await User.sync({ alter: false }).then(() => {
        // Create default user
        User.create({
            username: 'admin',
            groupUUID: '*',
            password: bcrypt.hashSync('hackme', config.app.password_encryption.salt_rounds)
        })
    })
    await Group.sync({ alter: false })
    await Playlist.sync({ alter: false })
    
    console.log('Database successfully setup')
}

export default new Database()
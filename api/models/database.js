import { Sequelize,DataTypes } from 'sequelize'
import config from '../config/config'
import bcrypt from 'bcrypt'

import { User, dbModel as userDBModel, dbSettings as userDBSettings} from '../models/user.js'
import { Group, dbModel as groupDBModel, dbSettings as groupDBSettings} from '../models/group.js'

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

    User.init(userDBModel, {sequelize, ...userDBSettings})
    await User.sync({ force: true }).then(() => {
        User.create({
            username: 'admin',
            password: bcrypt.hashSync('hackme', config.app.password_encryption.salt_rounds)
        })
    })

    Group.init(groupDBModel, {sequelize, ...groupDBSettings})
    await Group.sync({force: true}).then(() => {
        Group.findOrCreate({
            where: { groupname: 'default' },
            defaults: { groupname: 'default' }
        })
    })
    
    console.log('Database successfully setup')
}

export default new Database()
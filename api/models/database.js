import { DataTypes, Sequelize } from 'sequelize'
import config from '../config/config'
import bcrypt from 'bcrypt'

import { User, dbModel as userDBModel, dbSettings as userDBSettings} from '../models/user.js'
import { Group, dbModel as groupDBModel, dbSettings as groupDBSettings} from '../models/group.js'
import { Playlist, dbModel as playlistDBModel, dbSettings as playlistDBSettings} from '../models/playlist.js'
import { trace } from 'joi'


class Database {
    constructor() {
        this.sequelize = new Sequelize('mysql://'+config.mysql.user+':'+config.mysql.pass+'@'+config.mysql.host+':'+config.mysql.port+'/'+config.mysql.dbname, {
            dialect: 'mysql',
            logging: false
            //loggin: (...msg) => console.log(msg)
        })
    }

    async setup() {
        await this.sequelize.authenticate().catch((error) => {
            console.error('Unable to connect to the database:', error.message)
        });

        console.log('Connection has been established successfully.')

        // When connection successful, create tables
        await createTables(this.sequelize)
    }
}

const database = new Database()

async function createTables(sequelize) {
    console.log('Creating tables...')

    Playlist.init(playlistDBModel, {sequelize, ...playlistDBSettings})
    User.init(userDBModel, {sequelize, ...userDBSettings})
    Group.init(groupDBModel, {sequelize, ...groupDBSettings})

    Group.hasMany(User, {as: 'user', foreignKey: 'uuid', constraints: false})
    User.belongsTo(Group, { as: 'group', foreignKey: 'groupUUID' })

    User.hasMany(Playlist, {as: 'playlist', foreignKey: 'uuid', constraints: false})
    Playlist.belongsTo(User, { as: 'creator', foreignKey: 'creatorUUID' })

    await Group.sync({ alter: true })
    await Group.create({ groupname: 'root', uuid: '*', permissions: ['*'], hierarchy: 1001 })

    await User.sync({ alter: true })
    await User.create({ username: 'admin', groupUUID: '*', password: bcrypt.hashSync('hackme', config.app.password_encryption.salt_rounds) })

    await Playlist.sync({ alter: true })
    await setupTriggers()

    console.log('Database successfully setup')
}

async function setupTriggers() {
    // Delete users playlists if account gets deleted
    await database.sequelize.query("CREATE TRIGGER IF NOT EXISTS `DeletePlaylistsOnUserDeletion` BEFORE DELETE ON `tsr_users` FOR EACH ROW DELETE FROM tsr_playlists WHERE tsr_playlists.creatorUUID = old.uuid;")
}

export default database
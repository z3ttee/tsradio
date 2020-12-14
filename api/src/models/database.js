import { DataTypes, Sequelize } from 'sequelize'
import config from '../config/config'
import bcrypt from 'bcrypt'

import { User, dbModel as userDBModel, dbSettings as userDBSettings} from '../models/user.js'
import { Group, dbModel as groupDBModel, dbSettings as groupDBSettings} from '../models/group.js'
import { Channel, dbModel as channelDBModel, dbSettings as channelDBSettings } from './channel.js'

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

    User.init(userDBModel, {sequelize, ...userDBSettings})
    Group.init(groupDBModel, {sequelize, ...groupDBSettings})
    Channel.init(channelDBModel, {sequelize, ...channelDBSettings})

    Group.hasMany(User, {as: 'user', foreignKey: 'uuid', constraints: false})
    User.belongsTo(Group, { as: 'group', foreignKey: 'groupUUID' })

    User.hasMany(Channel, {as: 'channel', foreignKey: 'uuid', constraints: false})
    Channel.belongsTo(User, { as: 'creator', foreignKey: 'creatorUUID' })

    try {
        // Create groups table and create default group
        await Group.sync({ alter: true })
        await Group.findOrCreate({ 
            where: { groupname: 'root' },
            defaults: {
                groupname: 'root', 
                uuid: '*', 
                permissions: ['*'], 
                hierarchy: 1001 
            }
        })
    
        // Create users table and create default user
        await User.sync({ alter: true })
        await User.findOrCreate({
            where: { username: 'admin' },
            defaults: {
                username: 'admin', 
                groupUUID: '*', 
                password: bcrypt.hashSync('hackme', config.app.password_encryption.salt_rounds) 
            }
        })
    
        // Create playlists table
        await Channel.sync({ alter: true })

        // Setup triggers
        await setupTriggers()

        console.log('Database successfully setup')
    } catch (exception) {
        console.log(exception)
        
        console.log('Database initialized with errors:')
        console.log(exception.message)

        if(exception.errors) {
            for(let error of exception.errors) {
                console.log(error.message)
            }
        }
    }
}

async function setupTriggers() {
    // Delete users playlists if account gets deleted
    await database.sequelize.query("CREATE TRIGGER `DeletePlaylistsOnUserDeletion` BEFORE DELETE ON `tsr_users` FOR EACH ROW DELETE FROM tsr_playlists_info WHERE tsr_playlists_info.creatorUUID = old.uuid;").catch(() => {})
    await database.sequelize.query("CREATE TRIGGER `DeleteTrackFromTracksListOnTrackDeletion` BEFORE DELETE ON `tsr_tracks` FOR EACH ROW DELETE FROM tsr_playlists_tracks WHERE tsr_playlists_tracks.trackUUID = old.uuid;").catch(() => {})
    await database.sequelize.query("CREATE TRIGGER `DeletePlaylistFromTracksListOnPlaylistDeletion` BEFORE DELETE ON `tsr_playlists_info` FOR EACH ROW DELETE FROM tsr_playlists_tracks WHERE tsr_playlists_tracks.playlistUUID = old.uuid;").catch(() => {})
}

export default database
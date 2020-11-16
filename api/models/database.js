import { DataTypes, Sequelize } from 'sequelize'
import config from '../config/config'
import bcrypt from 'bcrypt'

import { User, dbModel as userDBModel, dbSettings as userDBSettings} from '../models/user.js'
import { Group, dbModel as groupDBModel, dbSettings as groupDBSettings} from '../models/group.js'
import { Playlist, dbModel as playlistDBModel, dbSettings as playlistDBSettings} from '../models/playlist.js'
import { Channel, dbModel as channelDBModel, dbSettings as channelDBSettings } from './channel.js'
import { Track, dbModel as trackDBModel, dbSettings as trackDBSettings } from './track.js'
import { TracksList, dbModel as trackslistDBModel, dbSettings as trackslistDBSettings } from './tracksList'

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
    Channel.init(channelDBModel, {sequelize, ...channelDBSettings})
    Track.init(trackDBModel, {sequelize, ...trackDBSettings})
    TracksList.init(trackslistDBModel, {sequelize, ...trackslistDBSettings})

    Group.hasMany(User, {as: 'user', foreignKey: 'uuid', constraints: false})
    User.belongsTo(Group, { as: 'group', foreignKey: 'groupUUID' })

    User.hasMany(Playlist, {as: 'playlist', foreignKey: 'uuid', constraints: false})
    Playlist.belongsTo(User, { as: 'creator', foreignKey: 'creatorUUID' })

    User.hasMany(Channel, {as: 'channel', foreignKey: 'uuid', constraints: false})
    Channel.belongsTo(User, { as: 'creator', foreignKey: 'creatorUUID' })

    Playlist.hasMany(Channel, {as: 'channel', foreignKey: 'uuid', constraints: false})
    Channel.belongsTo(Playlist, { as: 'playlist', foreignKey: 'playlistUUID' })

    Playlist.belongsToMany(Track, { through: TracksList, as: 'tracklist', foreignKey: 'uuid'})
    Track.belongsToMany(Playlist, { through: TracksList, as: 'tracklist', foreignKey: 'uuid'})

    Playlist.hasMany(TracksList, { as: 'tracks', foreignKey: 'playlistUUID'})
    TracksList.belongsTo(Playlist, { as: 'playlist', foreignKey: 'playlistUUID'})

    Track.hasMany(TracksList, { as: 'list', foreignKey: 'trackUUID'})
    TracksList.belongsTo(Track, { as: 'track', foreignKey: 'trackUUID'})

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
        await Playlist.sync({ alter: true })
        await Track.sync({ alter: true })
        await TracksList.sync({ alter: true })
    
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
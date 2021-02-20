import {Sequelize} from 'sequelize-typescript';
import config from '../config/config'
import ChannelHandler from '../handler/channelHandler';
import { Channel } from './channel';

export class Database {
    private static instance: Database = undefined
    private sequelize: Sequelize

    /**
     * Connect to database asynchronously
     */
    async connect() {
        console.info("Connecting to mysql database '"+config.mysql.user+"@"+config.mysql.host+":"+config.mysql.port+"/"+config.mysql.dbname+"'")
        this.sequelize = new Sequelize({
            database: config.mysql.dbname,
            dialect: "mysql",
            username: config.mysql.user,
            password: config.mysql.pass,
            host: config.mysql.host,
            port: config.mysql.port,
            logging: false
        })

        await this.sequelize.authenticate().then(async() => {
            console.info("Successfully connected to database '"+config.mysql.user+"@"+config.mysql.host+":"+config.mysql.port+"/"+config.mysql.dbname+"'")
            console.info("Setting up database")

            await this.sequelize.addModels([Channel])

            await this.setupNonDefaultTables()
            await ChannelHandler.loadChannels()
        }).catch((error) => {
            console.error("Could not connect to database '"+config.mysql.user+"@"+config.mysql.host+":"+config.mysql.port+"/"+config.mysql.dbname+"': "+error.message)
        })
    }

    /**
     * Get Database instance
     */
    static getInstance() {
        if(!this.instance) this.instance = new Database()
        return this.instance 
    }

    /**
     * Starting database setup for invites.
     */
    private async setupNonDefaultTables() {
        await Channel.sync({ alter: true })
    }
}
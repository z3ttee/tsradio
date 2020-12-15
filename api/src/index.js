import "core-js/stable";
import "regenerator-runtime/runtime";

import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import bodyParser from 'body-parser'
import io from 'socket.io'
import cors from 'cors'

import config from './config/config.js'
import Router from './router/index.js'
import Database from './models/database.js'
import Redis from './redis/redisClient.js'
import Socket from './models/socket.js'
import { Channel } from './models/channel.js'
//import ErrorHandler from './error/handler.js'

const app = express()
const socketio = io()

global.cfg = config

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/artworks', express.static('artworks'))

console.log("Starting api...")

// Establish redis connection
Redis.on("ready", async () => {
    console.log("Connected to redis successfully.")

    // Initially load all active channels from redis
    await Channel.loadChannels()
    Channel.setupInterval()

    // Setup custom router
    Router.setup(app)
    Database.setup().finally(startServer)

    const socket = Socket
    socket.setup(socketio).then(() => {
        app.ioHandler = socket
    })
})
Redis.on("error", (error) => {
    if(error.command == 'AUTH' && error.code == 'ERR') {
        console.log("Login credentials are invalid for redis connection")
        process.exit()
    } else if(error.code == 'ETIMEDOUT') {
        console.log("Could not connect to redis server on '"+error.address+":"+error.port+"'")
        process.exit()
    } else if(error.code == 'NOAUTH' ) {
        console.log("Failed to authenticate on redis database.")
        process.exit()
    } else {
        console.log(error)
    }
})

// Setup cors
const options = {
    cors: {
        origin: '*'
    }
}

async function startServer() {
    // Starting secure webserver if certificate exists
    if(fs.existsSync('sslcert/privkey.pem') && fs.existsSync('sslcert/fullchain.pem')) {
        var privateKey  = fs.readFileSync('sslcert/privkey.pem');
        var certificate = fs.readFileSync('sslcert/fullchain.pem');

        const credentials = {key: privateKey, cert: certificate}
        const httpsServer = https.createServer(credentials, app)

        socketio.attach(httpsServer, options)
        
        httpsServer.listen(cfg.ports.default, () => {
            console.log('App started and listening on port '+cfg.ports.default + ' over SSL protocol.')
        })
    } else {
        const httpServer = http.createServer(app)
        socketio.attach(httpServer, options)

        httpServer.listen(cfg.ports.default, () => {
            console.log('App started and listening on port '+cfg.ports.default)
        })
    }

    
}
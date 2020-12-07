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

// Establish redis connection
Redis.on("ready", () => {
    console.log("Connected to redis successfully.")

    // Initially load all active channels from redis
    Channel.loadActiveChannels()
    Channel.setupInterval()
})

Redis.on("error", (error) => console.log("A redis error occured:", error))


// Setup custom router
Router.setup(app)
Database.setup().finally(startServer)

// Setup socket handler
const options = {
    cors: {
        origin: '*'
    }
}

const socket = Socket
socket.setup(socketio).then(() => {
    app.ioHandler = socket
})

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
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
//import ErrorHandler from './error/handler.js'

const app = express()
const socketio = io()

global.cfg = config

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Centralized error handling
//app.use(ErrorHandler.handleError)
//process.on('unhandledRejection', () => {})
/*process.on('uncaughtException', (error) => {
    ErrorHandler.handleError(error)
})*/

// Establish redis connection
Redis.on("ready", () => console.log("Connected to redis successfully."))
Redis.on("error", (error) => console.log("A redis error occured:", error))

// Setup custom router
Router.setup(app)
Database.setup().finally(startServer)

// Setup socket handler
const socket = new Socket(socketio)
const options = {
    cors: {
        origin: '*'
    }
}
app.ioHandler = socket

async function startServer() {

    // Starting secure webserver if certificate exists
    if(fs.existsSync('sslcert/server.key') && fs.existsSync('sslcert/server.crt')) {
        var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
        var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

        const credentials = {key: privateKey, cert: certificate}
        const httpsServer = https.createServer(credentials, app)

        socketio.attach(httpsServer, options)
        
        httpsServer.listen(cfg.ports.ssl, () => {
            console.log('App started and listening on port '+cfg.ports.ssl)
        })
    } else {
        // Starting insecure webserver if certificate does not exist
        const httpServer = http.createServer(app)
        socketio.attach(httpServer, options)

        httpServer.listen(cfg.ports.default, () => {
            console.log('App started and listening on port '+cfg.ports.default)
        })
    }
}
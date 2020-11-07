import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import bodyParser from 'body-parser'

import config from './config/config'
import Router from './router/index.js'
import Database from './models/database'
import ErrorHandler from './error/handler.js'

const app = express()
global.cfg = config

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Centralized error handling
app.use(ErrorHandler.handleError)
process.on('unhandledRejection', (reason) => {throw reason})
process.on('uncaughtException', (error) => {
    ErrorHandler.handleError(error)
})

// Setup custom router
const router = new Router(app)
router.setup()
Database.setup()

// Starting secure webserver if certificate exists
if(fs.existsSync('sslcert/server.key') && fs.existsSync('sslcert/server.crt')) {
    var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

    const credentials = {key: privateKey, cert: certificate}
    const httpsServer = https.createServer(credentials, app)
    
    httpsServer.listen(cfg.ports.ssl, () => {
        console.log('App started and listening on port '+cfg.ports.ssl)
    })
} else {
    // Starting insecure webserver if certificate does not exist

    const httpServer = http.createServer(app)
    httpServer.listen(cfg.ports.default, () => {
        console.log('App started and listening on port '+cfg.ports.default)
    })
}
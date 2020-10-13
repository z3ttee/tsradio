import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import bodyParser from 'body-parser'
import router from './router/index.js'
import config from './config/config.json'

const app = express()
global.config = config

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/api', router)

const httpServer = http.createServer(app)
httpServer.listen(config.ports.default, () => {
    console.log('App started and listening on port '+config.ports.default)
})

// Starting secure webserver if certificate exists
if(fs.existsSync('sslcert/server.key') && fs.existsSync('sslcert/server.crt')) {
    var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

    const credentials = {key: privateKey, cert: certificate}
    const httpsServer = https.createServer(credentials, app)
    
    httpsServer.listen(config.ports.ssl, () => {
        console.log('App started and listening on port '+config.ports.ssl)
    })
}
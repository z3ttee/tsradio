import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'

const app = express()

app.get('/', (req, res) => {
    res.send("Hello World!")
})

const httpServer = http.createServer(app)
httpServer.listen(3000, () => {
    console.log('App started and listening on port '+3000)
})

// Starting secure webserver if certificate exists
if(fs.existsSync('sslcert/server.key') && fs.existsSync('sslcert/server.crt')) {
    var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

    const credentials = {key: privateKey, cert: certificate}
    const httpsServer = https.createServer(credentials, app)
    
    httpsServer.listen(3443, () => {
        console.log('App started and listening on port '+3443)
    })
}
import { wrapConsole } from './logging/logger';
import { Router } from './router/index'
import { Webserver } from './webserver'
import { Database } from './models/database';
import Express from 'express'

wrapConsole();

const expressApp: Express.Application = Router.getInstance().getExpressInstance()
const webserver = Webserver.getInstance()

// Register webserver events
webserver.on("boot", () => {
    console.info("Starting nodejs webserver...")
})
webserver.on("ready", () => {
    console.info("NodeJS Webserver is ready.")

    if(webserver.isHttps()) {
        console.info("Running in secure mode. (SSL)")
    } else {
        console.warn("Running in insecure mode. (SSL not enabled)")
        console.warn("This may be because of a missing ssl certificate and results in non-encrypted requests.")
    }
})

Database.getInstance().connect().then(() => {
    webserver.boot(expressApp)
})

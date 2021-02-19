import { createLogger, format, transports } from 'winston'

const date = new Date()
const currentDate = () => {

    return date.getDate().toString().padStart(2, "0")
            + "-" + (date.getMonth()+1).toString().padStart(2, "0")
            + "-" + date.getFullYear().toString()
            + "_"
}

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
}

const loggerFormat = format.printf((message) => {
    let timestamp = new Date().toISOString()
    return `[${timestamp}] [${message.level}]: ${message.message}`
})

const logger = createLogger({
    levels,
    level: 'info',
    format: format.combine(
        format.errors({ stack: true }),
        loggerFormat
    ),
    transports: [
        new transports.File({ filename: 'logs/error/' + currentDate() + 'error.log', level: 'warn'}),
        new transports.File({ filename: 'logs/all/' + currentDate() + 'all.log', level: 'debug' }),
        new transports.Console(),
    ]
})

function wrapConsole() {
    console.info = (message) => logger.log('info', message)
    console.warn = (message) => logger.log('warn', message)
    console.debug = (message) => logger.log('debug', message)
    console.error = (message) => logger.log('error', message)
}

export default logger
export { wrapConsole }
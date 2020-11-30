import Authenticator from "./authenticator"

const CHANNEL_METADATA_UPDATE = ""

class Socket {
    async setup(socketio) {
        this.socketio = socketio

        await this.socketio.use(async (socket, next) => {
            let handshakeData = socket.handshake
            let token = handshakeData.query.token

            if(!token) {
                socket.disconnect(true)
                return
            }

            let validator = await Authenticator.validateJWTString(token)

            if(!validator.passed) {
                socket.disconnect(true)
                return
            }

            next()
        })
    }

    broadcast(event, message){
        this.socketio.emit(event, message)
    }
}

export default new Socket()
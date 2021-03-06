import Authenticator from "./authenticator"
import { Channel } from "./channel.js"

class Socket {
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"
    CHANNEL_UPDATE_HISTORY = "channel_update_history"
    CHANNEL_UPDATE_LISTENER = "channel_update_listener"
    CHANNEL_INITIAL_TRANSPORT = "channel_initial_transport"

    connectedClients = {}

    async setup(socketio) {
        this.socketio = socketio

        this.socketio.use(async (socket, next) => {
            let handshakeData = socket.handshake
            let token = handshakeData.query.token
            let userUUID = handshakeData.query.uuid

            if(!token) {
                socket.disconnect(true)
                return
            }

            let validator = await Authenticator.validateJWTString(token)

            if(!validator.passed) {
                socket.disconnect(true)
                return
            }

            this.connectedClients[userUUID] = socket

            setTimeout(() => {
                let channels = {}

                Object.keys(Channel.activeChannels).forEach((uuid) => {
                    let channel = { ...Channel.activeChannels[uuid] }

                    // Remove history from initial transport
                    channel.history = undefined
                    channels[uuid] = channel
                })

                socket.emit(this.CHANNEL_INITIAL_TRANSPORT, channels)
            }, 300)
            
            socket.on("disconnect", async() => {
                await Channel.moveListenerTo(userUUID, undefined)
                delete this.connectedClients[userUUID]
            })
            next()
        })
        this.socketio.on('disconnect', async () => {
            console.log('Socket server closed')
        })
    }

    broadcast(event, message){
        this.socketio.emit(event, message)
    }
    async broadcastToRoom(room, event, message) {
        this.socketio.to(room).emit(event, {room, ...message})
    }

    getClient(userUUID) {
        return this.connectedClients[userUUID]
    }
}

export default new Socket()
import Authenticator from "./authenticator"
import { Channel } from "../models/channel.js"
import { ids } from "webpack"

class Socket {
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"
    CHANNEL_UPDATE_HISTORY = "channel_update_history"
    CHANNEL_UPDATE_LISTENER = "channel_update_listener"
    CHANNEL_SKIP = "channel_skipped"
    CHANNEL_INITIAL_TRANSPORT = "channel_initial_transport"

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

            setTimeout(() => {
                socket.emit(this.CHANNEL_INITIAL_TRANSPORT, Channel.activeChannels)
            }, 300)
            
            socket.on("disconnect", () => {
                Channel.moveListenerTo(userUUID, undefined)
            })
            socket.onAny((event, ...args) => {
                console.log(event)
                if(event == this.CHANNEL_SKIP) {
                    let data = args[0]
                    this.skipOrInitSkip(data)
                }
            })

            next()
        })
    }

    async skipOrInitSkip(data){
        try {
            Channel.skipOrInitSkip(data.uuid)
        } catch (error){  }
    }

    broadcast(event, message){
        this.socketio.emit(event, message)
    }
}

export default new Socket()
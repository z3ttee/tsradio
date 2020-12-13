import channeljs from '@/models/channel.js'
import config from '@/config/config.js'
import store from '@/store/index.js'
import { io } from 'socket.io-client'

class SocketClient {
    CHANNEL_UPDATE_STATUS = "channel_update_status"
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"
    CHANNEL_UPDATE_HISTORY = "channel_update_history"
    CHANNEL_UPDATE_LISTENER = "channel_update_listener"
    CHANNEL_SKIP = "channel_skipped"
    CHANNEL_INITIAL_TRANSPORT = "channel_initial_transport"

    setup() {
        this.disconnectInitiated = false
        this.socket = io(config.api.baseURL, {
            reconnection: false,
            query: {
                token: store.state.jwt,
                uuid: store.state.user.uuid
            }
        })

        this.socket.on("disconnect", async () => {
            console.log("Disconnected from Socket")
            if(store.state.loggedIn && !this.disconnectInitiated) {
                this.socket.connect()
            } else {
                console.log("Disconnected. Not trying to reconnect because user is not logged in.")
            }

            channeljs.clearAll()
            this.disconnectInitiated = false
        })
        this.socket.on("connect", async () => {
            console.log("Connected to socket.")
        })

        // Register events
        this.socket.on(this.CHANNEL_UPDATE_STATUS, async (data) => {     
            channeljs.updateStatus(data.uuid, data)
        })
        this.socket.on(this.CHANNEL_UPDATE_METADATA, async (data) => {
            channeljs.updateMetadata(data.uuid, data)
        })
        this.socket.on(this.CHANNEL_INITIAL_TRANSPORT, async (data) => {
            Object.values(data).forEach((channel) => {
                channeljs.setChannel(channel.uuid, channel)
            })
        })
        this.socket.on(this.CHANNEL_UPDATE_LISTENER, async (data) => {
            let destination = data.to ? data.to : ""
            let previous = data.from ? data.from : ""

            channeljs.moveListener(destination, previous)
        })
    }

    async connect() {
        if(!this.socket) return

        if(this.socket.disconnected) {
            this.socket.connect()
        }
    }

    async emit(eventName, message) {
        this.socket.emit(eventName, message)
    }
    async on(eventName, callback) {
        this.socket.on(eventName, callback)
    }
    async off(eventName) {
        this.socket.off(eventName)
    }

    async disconnect() {
        if(!this.socket) return

        this.disconnectInitiated = true
        this.socket.disconnect()
    }
}

export default new SocketClient()
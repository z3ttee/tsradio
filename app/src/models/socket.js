import channeljs from '@/models/channel.js'
import config from '@/config/config.js'
import store from '@/store/index.js'
import { io } from 'socket.io-client'

class SocketClient {
    CHANNEL_STATUS_UPDATE = "channel_update_status"
    CHANNEL_UPDATE_METADATA = "channel_update_metadata"
    CHANNEL_INITIAL_TRANSPORT = "channel_initial_transport"

    setup() {
        this.disconnectInitiated = false
        this.socket = io(config.api.baseURL, {
            reconnection: false,
            query: {
                token: store.state.jwt
            }
        })

        this.socket.on("disconnect", async () => {
            if(store.state.loggedIn && !this.disconnectInitiated) {
                this.socket.connect()
            } else {
                console.log("Disconnected. Not trying to reconnect because user is not logged in.")
            }

            this.disconnectInitiated = false
        })
        this.socket.on("connect", async () => {
            console.log("Connected to socket.")
        })

        // Register events
        this.socket.on(this.CHANNEL_STATUS_UPDATE, async (data) => {            
            if(!data.active) {
                channeljs.remove(data.uuid)
            }
        })
        this.socket.on(this.CHANNEL_UPDATE_METADATA, async (data) => {
            channeljs.update(data.uuid, data)
        })
        this.socket.on(this.CHANNEL_INITIAL_TRANSPORT, async (data) => {
            Object.values(data).forEach((channel) => {
                channeljs.update(channel.uuid, channel)
            })
        })
    }

    async connect() {
        if(!this.socket) return

        if(this.socket.disconnected) {
            this.socket.connect()
        }
    }

    async disconnect() {
        if(!this.socket) return

        this.disconnectInitiated = true
        this.socket.disconnect()
    }
}

export default new SocketClient()
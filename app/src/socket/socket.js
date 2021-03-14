import socketio from 'socket.io-client'
import store from '@/store'

import { UrlBuilder } from '@/utils/urlBuilder'
import SocketEvents from '@/socket/socketEvents'

import { 
    onChannelDeleteListener,
    onChannelUpdateListener,
    onChannelStateListener,
    onChannelHistoryListener,
    onChannelInfoListener,
    onChannelListenersListener,
    onChannelVotingListener,
    onChannelAddListener,
    onAuthentication,
    onDisconnect,
    onConnect
} from '@/socket/socketListener'

export class Socket {
    static instance = undefined

    socketEndpoint = UrlBuilder.buildSocketEndpoint()
    socket = undefined

    constructor() {
        this.socket = socketio.io(this.socketEndpoint.url, { 
            path: this.socketEndpoint.path, 
            transports: ['websocket'],
            auth: {
                token: store.state.account.session
            }
        })
        
        this.socket.on("connect", onConnect)
        this.socket.on("disconnect", onDisconnect)

        this.socket.on(SocketEvents.EVENT_CHANNEL_ADD, (data) => onChannelAddListener(data))
        this.socket.on(SocketEvents.EVENT_CHANNEL_UPDATE, (data) => onChannelUpdateListener(data))
        this.socket.on(SocketEvents.EVENT_CHANNEL_DELETE, (data) => onChannelDeleteListener(data))
        this.socket.on(SocketEvents.EVENT_CHANNEL_STATE, (data) => onChannelStateListener(data))
        this.socket.on(SocketEvents.EVENT_CHANNEL_INFO, (data) => onChannelInfoListener(data))
        this.socket.on(SocketEvents.EVENT_CHANNEL_LISTENERS, (data) => onChannelListenersListener(data))
        this.socket.on(SocketEvents.EVENT_AUTHENTICATION, (data) => onAuthentication(data))
    }

    /**
     * Subscribe to a channel to listen for its updates (history, voting)
     * @param {*} channelId Channel's id
     */
    static subscribeChannel() {
        Socket.getInstance().socket.on(SocketEvents.EVENT_CHANNEL_HISTORY, (data) => onChannelHistoryListener(data))
        Socket.getInstance().socket.on(SocketEvents.EVENT_CHANNEL_VOTING, (data) => onChannelVotingListener(data))
    }

    /**
     * Unsubscribe from a channel
     * @param {*} channelId Channel's id
     */
    static unsubscribeChannel() {
        Socket.getInstance().socket.off(SocketEvents.EVENT_CHANNEL_HISTORY)
        Socket.getInstance().socket.off(SocketEvents.EVENT_CHANNEL_VOTING)
    }

    static getInstance() {
        if(!this.instance) this.instance = new Socket()
        return this.instance
    }
}
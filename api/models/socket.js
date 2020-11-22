class Socket {
    constructor(socketio) {
        this.socketio = socketio

        this.socketio.use((socket, next) => {
            let handshakeData = socket.handshake
            let token = handshakeData.query.token

            if(!token) {
                socket.disconnect(true)
                return
            }

            next()
        })
    }
}

export default Socket
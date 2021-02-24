import path from "path"

export default {
    app: {
        port: 3334,
        rootDir: path.resolve(__dirname+"/../")
    },
    tsalliance: {
        clientId: '',
        clientSecret: '',
        clientToken: '',
        baseUrl: "https://api.tsalliance.eu"
    },
    mysql: {
        host: 'localhost',
        port: 3306,
        dbname: 'database',
        user: 'username',
        pass: 'password',
        prefix: 'ts_'
    },
    socketio: {
        password: "hackme"
    },
    genius: {
        client_secret: "ENTER_CLIENT_SECRET",
        client_id: "ENTER_CLIENT_ID",
        client_access_token: "ENTER_ACCESS_TOKEN"
    },
}
import path from "path"

export default {
    app: {
        host: 'http://localhost',
        port: 3334,
        rootDir: path.resolve(__dirname+"/../"),
        voting: {
            duration: 30,
            cooldown: 10
        },
        sudoUserPassword: "hackme"
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
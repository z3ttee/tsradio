import path from "path"

export default {
    app: {
        port: 3333,
        rootDir: path.resolve(__dirname+"/../")
    },
    tsalliance: {
        clientId: '',
        clientSecret: '',
        clientToken: ''
    },
    mysql: {
        host: 'localhost',
        port: 3306,
        dbname: 'database',
        user: 'username',
        pass: 'password',
        prefix: 'ts_'
    }
}
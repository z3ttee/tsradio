module.exports = {
    app: {
        devmode: false,
        password_encryption: {
            salt_rounds: 5
        },
        jwt_token_secret: '3713f138e9861f13b3666982bcba78f8c1abe663585306ec42521340da2',
        jwt_expiry: 1000*60*60*24*7 // 7 days
    },
    genius: {
        client_secret: "ENTER_CLIENT_SECRET",
        client_id: "ENTER_CLIENT_ID",
        client_access_token: "ENTER_ACCESS_TOKEN"
    },
    ports: {
        default: 3000
    },
    mysql: {
        host: 'localhost',
        port: 3306,
        dbname: 'database',
        user: 'username',
        pass: 'password',
        prefix: 'tsr_'
    },
    redis: {
        host: 'localhost',
        port: 6379,
        pass: 'password'
    }
}
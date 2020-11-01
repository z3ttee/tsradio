module.exports = {
    app: {
        devmode: false
    },
    ports: {
        default: 3000,
        ssl: 3443
    },
    mysql: {
        host: 'localhost',
        port: 3306,
        dbname: 'database',
        user: 'username',
        pass: 'password',
        prefix: 'tsr_'
    }
}
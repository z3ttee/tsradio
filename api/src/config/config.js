module.exports = {
    app: {
        devmode: false,
        password_encryption: {
            salt_rounds: 5
        },
        jwt_token_secret: '3713f138e9861f13b3666982bcba78f8c1abe663585306ec42521340da2',
        jwt_expiry: 1000*60*60*24*7 // 7 days
    },
    ports: {
        default: 3000
    },
    mysql: {
        host: 'easternexploration.de',
        port: 3306,
        dbname: 'tsradio',
        user: 'tsradio',
        pass: 'RadioTSCockila14€€€',
        prefix: 'tsr_'
    },
    redis: {
        host: 'easternexploration.de',
        port: 6379,
        pass: '^wZU20zr6uE0n5vBxISoeF9&xfeaq&&ETl9%P1qfOsy%BNa0%6mP5Tu1qQX^bv&I'
    }
}
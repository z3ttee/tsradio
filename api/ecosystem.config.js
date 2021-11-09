module.exports = {
    apps: [{
        name: "TSRadio",
        script: "index.js",
        increment_var: "APP_PORT",
        instances: 1,
        autorestart: true,
        watch: false,
        time: false,
        exec_interpreter: "node",
        env: {
            APP_PORT: 3334,
            NODE_ENV: "production"
        }
    }]
}
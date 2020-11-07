class Endpoint {

    constructor(options = {}) {
        this.requiresAuth = options.requiresAuth || false
    }
}

export default Endpoint
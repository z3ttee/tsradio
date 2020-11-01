class ApiError {
    constructor(code, message) {
        this.code = code
        this.message = message
    }

    getAsJSON() {
        return {
            code: this.code,
            message: this.message
        }
    }
}

const codes = {
    1: ""
}

export default { ApiError, codes }
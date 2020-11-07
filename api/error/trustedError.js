const errorCodes = {
    "API_INTERNAL_ERROR": { code: 500, message: 'Internal API error occured. Please contact system administrator.' },
    "API_AUTH_REQUIRED": { code: 400, message: 'This endpoint requires authentication' }
}

class TrustedError {
    constructor(res, errorCode) {
        this.errorCodes = errorCodes
        var error = {}

        if(typeof errorCode == 'string') {
            error = this.errorCodes[errorCode]
        } else {
            error = errorCode
        }

        this.error = error
        this.res = res
    }

    toJSON() {
        return JSON.stringify(this.error)
    }
}

export { TrustedError, errorCodes }
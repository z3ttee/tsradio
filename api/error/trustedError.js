const errorCodes = {
    "API_INTERNAL_ERROR": { code: 500, message: 'Internal API error occured. Please contact system administrator.' },
    "API_AUTH_REQUIRED": { code: 400, message: 'This endpoint requires authentication' },
    "API_JWT_INVALID": { code: 400, message: 'Provided JWT is invalid' },
    "API_JWT_NOT_SUPPLIED": { code: 400, message: 'JWT not supplied' },
    "API_CREDENTIALS_NOT_SUPPLIED": { code: 400, message: 'No credentials provided' },
    "API_CREDENTIALS_INVALID": { code: 400, message: 'Wrong credentials provided' }
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

        this.error = {err: errorCode, ...error}
        this.res = res
    }

    toJSON() {
        return JSON.stringify(this.error)
    }
}

export { TrustedError, errorCodes }
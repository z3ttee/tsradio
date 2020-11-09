const errorCodes = {
    "API_INTERNAL_ERROR": { code: 500, message: 'Internal API error occured. Please contact system administrator.' },
    "API_NO_PERMISSION": { code: 403, message: 'This endpoint requires permissions, which you do not fullfil.' },
    "API_AUTH_REQUIRED": { code: 401, message: 'This endpoint requires authentication.' },
    "API_JWT_INVALID": { code: 403, message: 'Provided JWT is invalid.' },
    "API_JWT_EXPIRED": { code: 403, message: 'Provided JWT is expired.' },
    "API_CREDENTIALS_NOT_SUPPLIED": { code: 400, message: 'No credentials provided.' },
    "API_CREDENTIALS_INVALID": { code: 400, message: 'Wrong credentials provided' },
    "API_GROUP_NAME_REQUIRED": { code: 400, message: 'The provided group data does not contain a groupname' },
    "API_NOT_DELETED": { code: 400, message: 'Resource not deleted' },
    "API_RESOURCE_EXISTS": { code: 400, message: 'Resource already exists' },
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
        return this.error
    }

    static get(errorCode) {
        return {err: errorCode, ...errorCodes[errorCode]}
    }
    static send(errors, response) {
        if(errors instanceof Object) {
            response.status(errors.code).json(errors)
        } else if(Array.isArray(errors)) {
            let responseJson = {code: 400, errors: []}

            for(let errorCode of errors) {
                let error = {err: errorCode, ...errorCodes[errorCode]}
                responseJson.errors.push(error)
            }

            responseJson.code = responseJson.errors[0].code
            response.status(responseJson.code).json(responseJson)
        } else {
            let error = {err: errors, ...errorCodes[errors]}
            response.status(error.code).json(error)
        }
    }
}

export { TrustedError, errorCodes }
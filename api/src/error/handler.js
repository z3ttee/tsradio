import { TrustedError } from './trustedError.js'

class ErrorHandler {
    handleError(err, req, res, next) {
        if(this.isTrustedError(err)) {
            err.res.status(err.code).json(err.toJSON())
        } else {
            console.trace(err)
        }
    }
    
    isTrustedError(error) {
        if (error instanceof TrustedError) {
            return true
        }
        return false
    }
}

const errorHandler = new ErrorHandler()
export default errorHandler
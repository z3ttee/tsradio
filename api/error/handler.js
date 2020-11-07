import { TrustedError } from './trustedError.js'

class ErrorHandler {
    handleError(err, req, res, next) {
        if(this.isTrustedError(err)) {
            err.res.setHeader('Content-Type', 'application/json');
            err.res.status(400).end(err.toJSON())
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
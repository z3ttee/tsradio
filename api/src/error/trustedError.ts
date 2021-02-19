import crypto from 'crypto'
import { Endpoint } from '../endpoint/endpoint'
import errors from './errors'

export class TrustedError extends Endpoint.Result {
    public readonly statusCode: number
    public readonly errorId: String
    public readonly message: String
    public readonly processId: String
    public readonly timestamp: Number

    constructor(errorId: String, statusCode: number, message: String) {
        super()
        this.statusCode = statusCode
        this.errorId = errorId
        this.message = message

        this.processId = crypto.randomBytes(8).toString('hex')
        this.timestamp = Date.now()
    }

    static get(error: Object) {
        let message: String = error["message"] || undefined
        return new TrustedError(error["errorId"] || "UNKNOWN_ERROR", error["statusCode"] || 400, message)
    }

}

export namespace TrustedError {
    export const Errors = errors
}
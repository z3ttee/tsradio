import crypto from 'crypto'
import { Endpoint } from '../endpoint/endpoint'

export class ValidationError extends Endpoint.Result {
    public readonly statusCode: number
    public readonly errorId: string
    public readonly processId: string
    public readonly timestamp: Number

    public readonly message: string
    public readonly fieldname: string
    public readonly type: string

    constructor(message: string, fieldname: string, type: string) {
        super()
        this.errorId = "VALIDATION_ERROR"
        this.statusCode = 400
        this.processId = crypto.randomBytes(8).toString('hex')
        this.timestamp = Date.now()

        this.message = message
        this.fieldname = fieldname
        this.type = type
    }

    static get(message: string, fieldname: string, type: string) {
        return new ValidationError(message, fieldname, type)
    }
}
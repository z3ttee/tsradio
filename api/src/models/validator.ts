import { ValidationError } from "../error/validationError"

import Joi from 'joi'
import passwordComplexity from "joi-password-complexity"

export class Validator {

    static async validate(joiSchema, inputs): Promise<Validator.ValidationResult> {
        let validationResult = new Validator.ValidationResult()
        
        let result = await joiSchema.validate(inputs)
        
        if(result.error) {
            validationResult.setError(new ValidationError(result.error.details[0].message, result.error.details[0].path[0], result.error.details[0].type.split(".", 1)[1]))
        }

        validationResult.setPassed(!result.error)
        return validationResult
    }

    /**
     * Validate member data object on creation
     * @param data Member data
     */
    static async validateChannelCreate(data: Object): Promise<Validator.ValidationResult> {
        const validationSchema = Joi.object({
            title: Joi.string().min(3).max(16).required(),
            mountpoint: Joi.string().min(3).max(32).alphanum().required(),
            description: Joi.string().min(3).max(150),
            creatorId: Joi.string().uuid().required(),
        })

        return await Validator.validate(validationSchema, data)
    }

    /**
     * Validate member data object on update
     * @param data Member data
     */
    static async validateChannelUpdate(data: Object): Promise<Validator.ValidationResult> {
        const validationSchema = Joi.object({
            title: Joi.string().min(3).max(16),
            mountpoint: Joi.string().min(3).max(32).alphanum(),
            description: Joi.string().min(3).max(150),
            creatorId: Joi.string().uuid(),
        })

        return await Validator.validate(validationSchema, data)
    }

    /**
     * Check if a string is of type uuid
     * @param uuid UUID as string
     * @returns {Boolean} True or False
     */
    static isUUID(uuid: string): Boolean {
        const regex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        return !!uuid.match(regex)
    }

    /**
     * Check if string is hex color code
     * @param value String
     * @returns True or False
     */
    static isHex(value: string): Boolean {
        const regex = /^#[A-Fa-f0-9]{6}/
        return !!value.match(regex)
    }

}

export namespace Validator {
    export class ValidationResult {
        private passed: Boolean
        private error: ValidationError

        public setPassed(passed: Boolean) {
            this.passed = passed
        }

        public setError(error: ValidationError) {
            this.error = error
        }

        public hasPassed() {
            return this.passed
        }

        public getError() {
            return this.error
        }
    }
}
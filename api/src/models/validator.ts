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

    static async validatePassword(input): Promise<Validator.ValidationResult> {
        let validationResult = new Validator.ValidationResult()
        
        let result = await passwordComplexity({
            min: 6,
            max: 32,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 1,
            requirementCount: 4
        }).validate(input)
        
        if(result.error) {
            validationResult.setError(new ValidationError(result.error.details[0].message, result.error.details[0].path[0] as string, result.error.details[0].type.split(".", 1)[1]))
        }

        validationResult.setPassed(!result.error)
        return validationResult
    }

    /**
     * Validate member data object on creation
     * @param data Member data
     */
    static async validateMemberCreate(data: Object): Promise<Validator.ValidationResult> {
        const validationSchema = Joi.object({
            name: Joi.string().alphanum().min(3).max(16).required(),
            password: Joi.string().min(3).max(32).required(),
            email: Joi.string().email().max(254).required(),
            role: Joi.string().uuid()
        })

        return await Validator.validate(validationSchema, data)
    }

    /**
     * Validate member data object on update
     * @param data Member data
     */
    static async validateMemberUpdate(data: Object): Promise<Validator.ValidationResult> {
        const validationSchema = Joi.object({
            name: Joi.string().alphanum().min(3).max(16),
            email: Joi.string().email().max(254),
            role: Joi.string().uuid()
        })

        return await Validator.validate(validationSchema, data)
    }

    /**
     * Validate system data object on creation
     * @param data System data
     */
    static async validateSystemCreate(data: Object): Promise<Validator.ValidationResult> {
        const validationSchema = Joi.object({
            name: Joi.string().alphanum().min(3).max(16).required(),
            url: Joi.string().uri().max(254).required()
        })

        return await Validator.validate(validationSchema, data)
    }

    /**
     * Validate system data object on update
     * @param data System data
     */
    static async validateSystemUpdate(data: Object): Promise<Validator.ValidationResult> {
        const validationSchema = Joi.object({
            name: Joi.string().alphanum().min(3).max(16),
            url: Joi.string().uri().max(254)
        })

        return await Validator.validate(validationSchema, data)
    }

    /**
     * Check if a string is of type uuid
     * @param uuid UUID as string
     * @returns {Boolean} True or False
     */
    static isUUID(uuid: string): Boolean {
        let regex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        return !!uuid.match(regex)
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
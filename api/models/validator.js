const passwordComplexity = require("joi-password-complexity");

class Validator {

    static async validate(joiSchema, inputs) {
        let passed = false
        let error = undefined

        let result = joiSchema.validate(inputs)

        if(result.error) {
            error = {
                err: "API_VALIDATION_ERROR",
                code: 400,
                message: result.error.details[0].message,
                type: result.error.details[0].type.split(".", 1)[1],
                path: result.error.details[0].path[0]
            }
        } else {
            passed = true
        }

        return { passed, error }
    }

    static async validatePassword(input) {
        let passed = false
        let error = undefined

        let validatedPass = passwordComplexity({
            min: 6,
            max: 32,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 1,
            requirementCount: 4
        }).validate(input)

        if(validatedPass.error) {
            error = {
                err: "API_VALIDATION_ERROR",
                code: 400,
                message: validatedPass.error.details[0].message,
                type: validatedPass.error.details[0].type.split(".", 1)[1],
                path: "password"
            }
        } else {
            passed = true
        }

        return { passed, error, value: input }
    }

}

export default Validator
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

}

export default Validator
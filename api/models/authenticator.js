import jwt, { TokenExpiredError } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import config from '../config/config.js'
import { TrustedError } from '../error/trustedError.js'
import { User } from '../models/user.js'

class Authenticator {
    static async authenticateJWT(request) {
        let token = request.headers['x-access-token'] || request.headers['authorization']

        let passed = false
        let data = undefined
        let error = undefined

        if(token) {
            if(token.startsWith('Bearer ')) {
                token = token.slice(7)
            }

            try {
                let decoded = jwt.verify(token, config.app.jwt_token_secret)
                data = await User.findOne({ where: { uuid: decoded.uuid } })

                passed = true
            } catch (exception) {
                if(exception instanceof TokenExpiredError) {
                    error = TrustedError.get("API_JWT_EXPIRED")
                } else {
                    console.log(exception)
                }
            }
        }

        return { passed, data, error }
    }

    static async loginWithCredentials(request, response) {
        let passed = false
        let token = undefined
        let error = undefined

        let username = request.body.username
        let password = request.body.password

        if(!username && !password) {
            error = TrustedError.get("API_CREDENTIALS_NOT_SUPPLIED")
        } else {
            let user = await User.findOne({ where: { username }})

            if(user) {        
                if(bcrypt.compareSync(password, user.password)) {
                    token = jwt.sign({ uuid: user.uuid }, config.app.jwt_token_secret, {expiresIn: config.app.jwt_expiry+'ms'})
                    passed = true
                } else {
                    error = TrustedError.get("API_CREDENTIALS_INVALID")
                }
            } else {
                error = TrustedError.get("API_RESOURCE_NOT_FOUND")
            }
        }

        return { passed, token, error }
    }
}

export default Authenticator
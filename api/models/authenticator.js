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
        let username = request.body.username
        let password = request.body.password

        if(!username && !password) {
            TrustedError.send("API_CREDENTIALS_NOT_SUPPLIED", response)
            return false
        }

        let user = await User.getByName(username)

        console.log(Date.now())

        if(bcrypt.compareSync(password, user.password)) {
            
            return jwt.sign({ uuid: user.uuid }, config.app.jwt_token_secret, {expiresIn: config.app.jwt_expiry+'ms'})
        } else {
            TrustedError.send("API_CREDENTIALS_INVALID", response)
            return false
        }
    }
}

export default Authenticator
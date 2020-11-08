import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import config from '../config/config.js'
import { TrustedError } from '../error/trustedError.js'
import { User } from '../models/user.js'

class Authenticator {
    static authenticateJWT(request) {
        let token = request.headers['x-access-token'] || request.headers['authorization']

        let passed = false
        let data = undefined

        if(token) {
            if(token.startsWith('Bearer ')) {
                token = token.slice(7)
            }

            jwt.verify(token, config.app.jwt_token_secret, (err, decoded) => {
                if(!err) {
                    passed = false
                    data = decoded
                }
            })
        }

        return { passed, data }
    }

    static async loginWithCredentials(request, response) {
        let username = request.body.username
        let password = request.body.password
        let user = await User.getByName(username)

        if(!username && !password) {
            throw new TrustedError(response, "API_CREDENTIALS_NOT_SUPPLIED")
        }

        if(bcrypt.compareSync(password, user.password)) {
            return jwt.sign({ uuid: user.uuid }, config.app.jwt_token_secret, {expiresIn: '24h'})
        } else {
            throw new TrustedError(response, "API_CREDENTIALS_INVALID")
        }
    }
}

export default Authenticator
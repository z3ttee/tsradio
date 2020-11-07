import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import bcrypt from 'bcrypt'
import { TrustedError } from '../error/trustedError.js'

import { User } from '../models/user.js'

class Authenticator {
    authenticateJWT(request, response) {
        let token = request.headers['x-access-token'] || request.headers['authorization']

        if(token.startsWith('Bearer ')) {
            token = token.slice(7)
        }

        if(token) {
            jwt.verify(token, config.app.jwt_token_secret, (err, decoded) => {
                if(err) {
                    throw new TrustedError(response, "API_JWT_INVALID")
                } else {
                    request.decoded = decoded
                }
            })
        } else {
            throw new TrustedError(response, "API_JWT_NOT_SUPPLIED")
        }
    }

    async loginWithCredentials(request, response) {
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

export default new Authenticator()
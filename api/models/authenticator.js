import jwt, { TokenExpiredError } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import config from '../config/config.js'
import { TrustedError } from '../error/trustedError.js'
import { User } from '../models/user.js'
import { Group } from './group.js'

class Authenticator {
    static async validateJWT(request) {
        let token = request.headers['x-access-token'] || request.headers['authorization']

        let passed = false
        let data = undefined
        let error = undefined

        if(token) {
            // Remove Bearer from header value
            if(token.startsWith('Bearer ')) {
                token = token.slice(7)
            }

            try {
                // Verify jwt and load user data
                let decoded = jwt.verify(token, config.app.jwt_token_secret)
                data = await User.findOne({ 
                    where: { 
                        uuid: decoded.uuid 
                    }, 
                    attributes: ['uuid', 'groupUUID'],
                    include: [
                        { model: Group, as: 'group', attributes: ['permissions', 'hierarchy'] }
                    ]
                })

                // Set error if user account was not found, otherwise set passed to true
                if(!data) {
                    error = TrustedError.get("API_ACCOUNT_NOT_FOUND")
                    data = undefined
                } else {
                    passed = true
                    data.group.permissions = JSON.parse(data.group.permissions)
                }

            } catch (exception) {
                // Set error, if jwt is expired
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
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import {TrustedError} from '../error/trustedError.js'

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

    loginWithCredentials(request, response) {
        let username = request.body.username
        let password = request.body.password

        let mockedUsername = "zettee"
        let mockedPassword = "123"

        if(username && password) {
            if(username == mockedUsername && password == mockedPassword) {
                let token = jwt.sign({username}, config.app.jwt_token_secret, {expiresIn: '24h'})
                return token
            } else {
                throw new TrustedError(response, "API_CREDENTIALS_INVALID")
            }
        } else {
            throw new TrustedError(response, "API_CREDENTIALS_NOT_SUPPLIED")
        }
    }
}

export default new Authenticator()
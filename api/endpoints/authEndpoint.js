import Authenticator from '../models/authenticator.js'

class AuthEndpoint {

    async actionSignin(route) {
        let token = Authenticator.loginWithCredentials(route.req, route.res)
        return {token}
    }

}

export default new AuthEndpoint();
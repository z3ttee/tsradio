import Authenticator from '../models/authenticator.js'
import cookieParser from 'cookie'
import { TrustedError } from '../error/trustedError.js'
import { Channel } from '../models/channel.js'

class AuthEndpoint {

    /**
     * @api {post} /auth/signin Signin User
     * @apiGroup Authentication
     * @apiDescription Endpoint for signing users in to obtain a jwt for future authorized api calls
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiExample json-body: 
     * {
     *      "username": "max",
     *      "password": "musterpassword"
     * }
     * 
     * @apiSuccess (200) {String} token Users JWT after successful login
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "token": "123456"
     * }
     * 
     * @apiVersion 1.0.0
     */
    async actionSignin(route) {
        let authenticator = await Authenticator.loginWithCredentials(route.req, route.res)

        if(authenticator.passed) {
            return { token: authenticator.token }
        } else {
            return authenticator.error
        }
    }

    /**
     * @api {get} /auth/verify Verify Users session
     * @apiGroup Authentication
     * @apiDescription Endpoint for verifying users session to check if future api calls are granted
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiSuccess (200) {String} token Users JWT after successful login
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {}
     * 
     * @apiVersion 1.0.0
     */
    async actionVerify(route) {
        let authenticator = await Authenticator.validateJWT(route.req)

        if(authenticator.passed) {
            return { }
        } else {
            return authenticator.error
        }
    }

    /**
     * @api {get} /auth/signout Signout User
     * @apiGroup Authentication
     * @apiDescription Endpoint for signing users out to deny future authorized api calls
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiExample json-body: 
     * {
     *      "username": "max",
     *      "password": "musterpassword"
     * }
     * 
     * @apiSuccess (200) {String} token Users JWT after successful login
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "token": "123456"
     * }
     * 
     * @apiVersion 1.0.0
     */
    async actionListenerLogin(route) {
        try {
            let mountpoint = route.req.body.mount

            let path = mountpoint.split("?")[0]
            let query = mountpoint.split("?")[1].split("&")

            let token = query[0]
            let userUUID = query[1]

            let authenticator = await Authenticator.validateJWTString(token)
    
            if(authenticator.passed) {
                route.res.set('icecast-auth-user', '1');
                console.log("authenticated")
                Channel.moveListenerTo(userUUID, path)
                return {}
            } else {
                route.res.set('icecast-auth-user', '0');
                route.res.set('Icecast-Auth-Message', authenticator.error.message);
                console.log("error: "+authenticator.error)
                return authenticator.error
            }
        } catch (exception) {
            let error = TrustedError.get("API_INTERNAL_ERROR")
            route.res.set('icecast-auth-user', '0');
            route.res.set('Icecast-Auth-Message', error.message);
            console.log("not authenticated: "+error.message)
            return error
        }
        
    }

}

export default new AuthEndpoint();
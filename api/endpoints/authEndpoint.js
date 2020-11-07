import Authenticator from '../models/authenticator.js'

class AuthEndpoint {

    /**
     * @api {get} /auth/signin Signin User
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
        let token = await Authenticator.loginWithCredentials(route.req, route.res)
        return {token}
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
    async actionSignout(route) {
        let token = Authenticator.loginWithCredentials(route.req, route.res)
        return {token}
    }

}

export default new AuthEndpoint();
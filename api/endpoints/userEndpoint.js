import { ApiError } from '../error/error.js';
import Endpoint from './endpoint.js'

class UserEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
    }

    /**
     * @api {get} /users/:id
     * 
     */
    async actionGetOne(route) {

    }

    /**
     * @api {get} /users
     * 
     */
    async actionGetMultiple(route) {
        
    }

    /**
     * @api {post} /users
     * 
     */
    async actionCreate(route) {
        throw new ApiError(200, "Default")
    }

}

export default new UserEndpoint();
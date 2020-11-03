class UserEndpoint {

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
        return {msg: 'get multiple users'}
    }

    /**
     * @api {post} /users
     * 
     */
    async actionCreate(route) {
        return {msg: 'create user'}
    }

}

export default new UserEndpoint();
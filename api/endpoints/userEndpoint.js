import { TrustedError } from '../error/trustedError.js'
import { Sequelize, DataTypes } from 'sequelize'
import Endpoint from './endpoint.js'

import { User } from '../models/user.js'
import Database from '../models/database.js'
import { Group } from '../models/group.js'

class UserEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
    }

    /**
     * @api {get} /users/:id Get User 
     * @apiGroup Users
     * @apiDescription Endpoint for getting self user information
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} id Users unique ID (or @me for current user).
     * 
     * @apiSuccess (200) {String} uuid Users unique id
     * @apiSuccess (200) {String} username Users unique name
     * @apiSuccess (200) {String} groupUUID Users unique id
     * @apiSuccess (200) {Timestamp} createdAt Date at which user was created
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "09a7e1ff-ebd3-4683-8f77-28f41bfb9b7c",
     *      "username": "user123",
     *      "groupUUID": "4c0530ba-6951-415e-865c-6db93205d8bc",
     *      "createdAt": "2020-11-08T15:16:03.000Z"
     * }
     * 
     * @apiVersion 1.0.0
     */
    async actionGetOne(route) {
        let id = route.params.id
        let uuid = ""

        if(id == "@me") {
            uuid = route.user.uuid
        } else {
            uuid = id
        }

        let user = await User.findOne({
            where: { uuid },
            attributes: ['uuid', 'username', 'groupUUID', 'createdAt'],
        }, {sequelize: Database.sequelize})

        return user
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
        //throw new TrustedError(route.res, "API_INTERNAL_ERROR")
    }

}

export default new UserEndpoint();
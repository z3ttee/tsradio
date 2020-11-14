import Endpoint from './endpoint.js'
import Joi from 'joi'
import Validator from '../models/validator.js'
import bcrypt from 'bcrypt'
import config from '../config/config.js'

import { TrustedError } from '../error/trustedError.js'
import { Op } from 'sequelize'
import { User } from '../models/user.js'
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
     * @apiError 404 The requested user was not found.
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
            attributes: ['uuid', 'username', 'createdAt'],
            include: [
                {model: Group, as: 'group', attributes: ['uuid', 'groupname']}
            ]
        })

        return user
    }

    /**
     * @api {get} /users Get Users
     * @apiGroup Users
     * @apiDescription Endpoint for getting multiple users. Pagination is available
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * @apiParam {String} offset Offset index to start looking in database. Min: 0
     * @apiParam {String} limit Amount of entries to be looked up in database. Min: 1, Max: 30
     * 
     * @apiExample json-body:
     * {
     *      "offset": 0,
     *      "limit": 30
     * }
     *
     * @apiSuccess (200) {Integer} available Number of available entries in database (used to calc pages in frontend)
     * @apiSuccess (200) {Object} user Entry in returned array, holding a users info
     * @apiSuccess (200) {String} user.uuid Users unique id
     * @apiSuccess (200) {String} user.username Users unique name
     * @apiSuccess (200) {String} user.groupUUID Users group id
     * @apiSuccess (200) {Timestamp} user.createdAt Users date of creation
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "available": 1,
     *      "entries": [
     *          {
     *              "uuid": "09a7e1ff-ebd3-4683-8f77-28f41bfb9b7c",
     *              "username": "user123",
     *              "groupUUID": "4c0530ba-6951-415e-865c-6db93205d8bc",
     *              "createdAt": "2020-11-08T15:16:03.000Z"
     *          } 
     *      ]
     * }
     * 
     * @apiPermission permission.users.canRead
     * @apiVersion 1.0.0
     */
    async actionGetMultiple(route) {
        let offset = route.req.body.offset || 0
        let limit = route.req.body.limit || 1

        if(offset < 0) offset = 0
        if(limit > 30 || limit < 1) limit = 30

        let users = await User.findAll({
            offset: offset,
            limit: limit,
            attributes: ['uuid', 'username', 'createdAt'],
            include: [
                {model: Group, as: 'group', attributes: ['uuid', 'groupname']}
            ]
        })

        let availableCount = await User.findAndCountAll({ where: {}})
        return { available: availableCount.count, entries: users }
    }

    /**
     * @api {post} /users Create User 
     * @apiGroup Users
     * @apiDescription Endpoint for creating new user
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} username Users unique username (required).
     * @apiParam {String} password Users password (required).
     * @apiParam {String} groupUUID Users permission group id (optional).
     * @apiParam {String} username Users unique username (required).
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
     * @apiPermission permission.users.canCreate
     * @apiVersion 1.0.0
     */
    async actionCreate(route) {
        let username = route.req.body.username
        let password = route.req.body.password
        let groupUUID = route.req.body.groupUUID

        const validationSchema = Joi.object({
            username: Joi.string().alphanum().min(3).max(16).required(),
            password: Joi.string().min(3).max(32).required(),
            groupUUID: Joi.string().uuid()
        })

        let validation = await Validator.validate(validationSchema, {username, password, groupUUID})

        if(!validation.passed) {
            return validation.error
        }

        let exists = await User.findOne({ where: { username }})
        if(exists) {
            return TrustedError.get("API_RESOURCE_EXISTS")
        }

        let passwordValidation = await Validator.validatePassword(password)

        if(!passwordValidation.passed) {
            return passwordValidation.error
        }

        let user = await User.create({
            username,
            password: bcrypt.hashSync(password, config.app.password_encryption.salt_rounds),
            groupUUID
        })

        user.password = undefined
        return user
    }

    /**
     * @api {put} /users/:id Update User 
     * @apiGroup Users
     * @apiDescription Endpoint for updating an user
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} username Users updated unique username.
     * @apiParam {String} password Users updated password.
     * @apiParam {String} groupUUID Users updated permission group id.
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {}
     * 
     * @apiPermission permission.users.canUpdate
     * @apiVersion 1.0.0
     */
    async actionUpdateOne(route) {
        let id = route.params.id
        let username = route.req.body.username
        let password = route.req.body.password
        let groupUUID = route.req.body.groupUUID

        const validationSchema = Joi.object({
            username: Joi.string().alphanum().min(3).max(16),
            password: Joi.string().min(6).max(32),
            groupUUID: Joi.string().uuid()
        })

        let validation = await Validator.validate(validationSchema, {username, password, groupUUID})

        if(!validation.passed) {
            return validation.error
        }

        let userExistsResult = await User.findAll({ where: { [Op.or]: [{uuid: id}, {username: username || ''}] }})
        let idExists = false
        let existsUsername = false

        for(let result of userExistsResult) {
            if(result.username == username && result.uuid != id) {
                existsUsername = true
            }
            if(result.uuid == id) {
                idExists = true
            }
        }

        if(!idExists) {
            return TrustedError.get("API_RESOURCE_NOT_FOUND")
        }
        if(existsUsername) {
            return TrustedError.get("API_RESOURCE_EXISTS")
        }

        if(password) {
            let passwordValidation = await Validator.validatePassword(password)

            if(!passwordValidation.passed) {
                return passwordValidation.error
            }
        }

        await User.update( {
            username,
            password: password ? bcrypt.hashSync(password, config.app.password_encryption.salt_rounds) : undefined,
            groupUUID
        },{
            where: { uuid: id }
        })

        return {}
    }

    /**
     * @api {delete} /users/:id Delete User
     * @apiGroup Users
     * @apiDescription Endpoint for deleting an users
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * @apiParam {String} id Users unique id
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {}
     * 
     * @apiPermission permission.users.canDelete
     * @apiVersion 1.0.0
     */
    async actionDeleteOne(route) {
        let id = route.params.id

        // Check if hierarchy is higher than resource that should be deleted
        if(route.user.group) {
            let hierarchy = route.user.group.hierarchy
            let targetUser = await User.findOne({ where: { uuid: id }, attributes: ['groupUUID']})

            if(!targetUser) {
                return TrustedError.get("API_RESOURCE_NOT_FOUND")
            }
            if(targetUser.groupUUID == '*') {
                return TrustedError.get("API_NO_PERMISSION")
            }

            let targetUserGroup = await Group.findOne({ where: { uuid: targetUser.group }, attributes: ['hierarchy']})
            let targetHierarchy = targetUserGroup ? targetUserGroup.hierarchy : 0

            // throw error if hierarchy lower or equal
            if(targetHierarchy >= hierarchy) {
                return TrustedError.get("API_NO_PERMISSION")
            }
        }

        let result = await User.destroy({where: { uuid: id }})

        if(result != 1) {
            return TrustedError.get("API_RESOURCE_NOT_DELETED")
        }
        return {}
    }

}

export default new UserEndpoint();
import Endpoint from './endpoint.js'

import { Group } from '../models/group.js'
import { TrustedError } from '../error/trustedError.js'
import { Op } from 'sequelize'

import Joi from 'joi'
import Validator from '../models/validator.js'

class GroupEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
    }

    /**
     * @api {post} /groups Create Group
     * @apiGroup Groups
     * @apiDescription Endpoint for creating new permission groups. Returns the created entry
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiExample json-body: 
     * {
     *      "groupname": "default",
     *      "hierarchy": 0,
     *      "permissions": ["permission1", "permission2"]
     * }
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "913c79a0-05ea-4008-8df9-8fc11749fe3d",
     *      "groupname": "default",
     *      "hierarchy": 0,
     *      "permissions": [
     *          "permission1",
     *          "permission2"
     *      ],
     *      "createdAt": "2020-11-09T09:39:54.589Z"
     * }
     * 
     * 
     * @apiPermission permission.groups.canCreate
     * @apiVersion 1.0.0
     */
    async actionCreate(route) {
        let groupname = route.req.body.groupname
        let permissions = route.req.body.permissions
        let hierarchy = route.req.body.hierarchy

        const validationSchema = Joi.object({
            groupname: Joi.string().alphanum().min(3).max(16).required(),
            hierarchy: Joi.number().min(0).max(1000),
            permissions: Joi.array()
        })

        let validator = await Validator.validate(validationSchema, {groupname, permissions, hierarchy})

        if(!validator.passed) {
            return validator.error
        }

        let exists = await Group.findOne({ where: { groupname }})
        if(exists) {
            return TrustedError.get("API_RESOURCE_EXISTS")
        }

        let result = await Group.create({groupname, permissions, hierarchy})
        return result
    }

    /**
     * @api {get} /groups/:id Get Group
     * @apiGroup Groups
     * @apiDescription Endpoint for getting a group
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * @apiParam {String} id Groups unique ID.
     *
     * @apiSuccess (200) {String} uuid Groups unique id
     * @apiSuccess (200) {String} groupname Groups unique name
     * @apiSuccess (200) {Array} permissions Groups list of permissions
     * @apiSuccess (200) {Timestamp} createdAt Date at which group was created
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "913c79a0-05ea-4008-8df9-8fc11749fe3d",
     *      "groupname": "default",
     *      "hierarchy": 0,
     *      "permissions": [
     *          "permission1",
     *          "permission2"
     *      ],
     *      "createdAt": "2020-11-09T09:39:54.589Z"
     * }
     * @apiError 404 The requested group was not found.
     * @apiPermission permission.groups.canRead
     * @apiVersion 1.0.0
     */
    async actionGetOne(route) {
        let id = route.params.id

        let group = await Group.findOne({where: {uuid: id}})

        if(!group) {
            return TrustedError.get("API_RESOURCE_NOT_FOUND")
        }

        return group
    }

    /**
     * @api {get} /groups Get Groups
     * @apiGroup Groups
     * @apiDescription Endpoint for getting multiple groups. Pagination is available
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
     * @apiSuccess (200) {Object} group Entry in returned array, holding a groups info
     * @apiSuccess (200) {String} group.uuid Groups unique id
     * @apiSuccess (200) {String} group.groupname Groups unique name
     * @apiSuccess (200) {Array} group.permissions Groups array of permissions
     * @apiSuccess (200) {Timestamp} group.createdAt Date at which group was created
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *      ...,
     *      {
     *          "uuid": "913c79a0-05ea-4008-8df9-8fc11749fe3d",
     *          "groupname": "default",
     *          "hierarchy": 0,
     *          "permissions": [
     *              "permission1",
     *              "permission2"
     *          ],
     *          "createdAt": "2020-11-09T09:39:54.589Z"
     *      }, 
     *      ...
     * ]
     * @apiPermission permission.groups.canRead
     * @apiVersion 1.0.0
     */
    async actionGetMultiple(route) {
        let offset = Math.min(Math.max(route.req.body.offset || 0, 30), 0)
        let limit = Math.min(Math.max(route.req.body.limit || 1, 30), 1)

        let groups = await Group.findAll({
            offset: offset,
            limit: limit
        })

        if(!groups) {
            return TrustedError.get("API_RESOURCE_NOT_FOUND")
        }
        
        return groups
    }

    
    /**
     * @api {delete} /groups/:id Delete Group
     * @apiGroup Groups
     * @apiDescription Endpoint for deleting a group
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * @apiParam {String} id Groups unique id
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {}
     * 
     * @apiPermission permission.groups.canDelete
     * @apiVersion 1.0.0
     */
    async actionRemoveOne(route) {
        let id = route.params.id

        // Check if hierarchy is higher than resource that should be deleted
        if(route.user.group) {
            let hierarchy = route.user.group.hierarchy
            let group = await Group.findOne({ where: { uuid: id }})

            if(!group) {
                return TrustedError.get("API_RESOURCE_NOT_FOUND")
            }

            // throw error if hierarchy lower or equal
            if(group.hierarchy >= hierarchy) {
                return TrustedError.get("API_NO_PERMISSION")
            }
        }

        let result = await Group.destroy({where: { uuid: id }})

        if(result != 1) {
            return TrustedError.get("API_RESOURCE_NOT_DELETED")
        }

        return {}
    }

    /**
     * @api {put} /groups/:id Update Group
     * @apiGroup Groups
     * @apiDescription Endpoint for updating an existing permission group.
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} id Groups unique ID.
     * @apiParam {String} groupname Groups unique updated name.
     * @apiParam {String} hierarchy Define updated order in hierarchy for group.
     * @apiParam {Array} permissions Updated list of all permissions.
     * 
     * @apiExample json-body: 
     * {
     *      "groupname": "default",
     *      "hierarchy": 0,
     *      "permissions": ["permission1", "permission2"]
     * }
     * 
     * @apiPermission permission.groups.canUpdate
     * @apiVersion 1.0.0
     */
    async actionUpdateOne(route) {
        let id = route.params.id
        let groupname = route.req.body.groupname
        let permissions = route.req.body.permissions
        let hierarchy = route.req.body.hierarchy

        const validationSchema = Joi.object({
            groupname: Joi.string().alphanum().min(3).max(16),
            hierarchy: Joi.number().min(0).max(1000),
            permissions: Joi.array()
        })

        let validator = await Validator.validate(validationSchema, {groupname, permissions, hierarchy})

        if(!validator.passed) {
            return validator.error
        }

        let groupExistsResult = await Group.findAll({ where: { [Op.or]: [{uuid: id}, {groupname: groupname || ''}] }})
        let idExists = false
        let existsGroupname = false

        for(let result of groupExistsResult) {
            if(result.groupname == groupname && result.uuid != id) {
                existsGroupname = true
            }
            if(result.uuid == id) {
                idExists = true
            }
        }

        if(!idExists) {
            return TrustedError.get("API_RESOURCE_NOT_FOUND")
        }
        if(existsGroupname) {
            return TrustedError.get("API_RESOURCE_EXISTS")
        }

        await Group.update({groupname, permissions, hierarchy}, { where: { uuid: id }})
        return {}
    }

}

export default new GroupEndpoint();
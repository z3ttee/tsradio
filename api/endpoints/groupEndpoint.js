import Endpoint from './endpoint.js'

import { Group } from '../models/group.js'
import { TrustedError } from '../error/trustedError.js'
import { User } from '../models/user.js'

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
     *      "permissions": ["permission1", "permission2"]
     * }
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "913c79a0-05ea-4008-8df9-8fc11749fe3d",
     *      "groupname": "default",
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

        if(!groupname) {
            return TrustedError.get("API_GROUP_NAME_REQUIRED")
        }

        let exists = await Group.findOne({ where: { groupname }})
        if(exists) {
            return TrustedError.get("API_GROUP_NAME_EXISTS")
        }

        let result = await Group.create({groupname, permissions})
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

        group.permissions = JSON.parse(group.permissions)
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

        console.log(offset,limit)

        let groups = await Group.findAll({
            offset: offset,
            limit: limit
        })

        for(let group of groups) {
            group.permissions = JSON.parse(group.permissions)
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

        let result = await Group.destroy({where: { uuid: id }})
        console.log(result)

        if(result != 1) {
            return TrustedError.get("API_NOT_DELETED")
        }
    }

}

export default new GroupEndpoint();
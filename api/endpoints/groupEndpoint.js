import { Group } from '../models/group.js'
import { TrustedError } from '../error/trustedError.js'

class GroupEndpoint {

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
     * @apiPermission permission.group.canCreate
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
     * @apiVersion 1.0.0
     */
    async actionGetOne(route) {
        
    }

}

export default new GroupEndpoint();
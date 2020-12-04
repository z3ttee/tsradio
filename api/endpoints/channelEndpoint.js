import Endpoint from './endpoint.js'
import Joi from 'joi'
import Validator from '../models/validator.js'
import { Channel } from '../models/channel.js'
import { User } from '../models/user.js'
import { TrustedError } from '../error/trustedError.js'

class ChannelEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
    }

    /**
     * @api {post} /channels Create Channel 
     * @apiGroup Channels
     * @apiDescription Endpoint for creating a new channel
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} title Channels title (required) (Min: 3, Max: 120).
     * @apiParam {String} path Channels mountpoint on icecast (required) (Min: 3, Max: 16).
     * @apiParam {String} description Channels description (optional) (Max: 240).
     * 
     * @apiExample json-body:
     * {
     *      "title": "This is a title",
     *      "description": "This is a description",
     * }
     * 
     * @apiSuccess (200) {String} uuid Channels unique id
     * @apiSuccess (200) {String} title Channels title
     * @apiSuccess (200) {String} path Channels mountpoint on icecast
     * @apiSuccess (200) {String} description Channels description
     * @apiSuccess (200) {String} creatorUUID Channels creator unique user id
     * @apiSuccess (200) {Array} playlist Channels playlist
     * @apiSuccess (200) {Timestamp} updatedAt Date of last update
     * @apiSuccess (200) {Timestamp} createdAt Date at which user was created
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "a6f2d99a-3c7c-4730-8418-8b694fe4acc2",
     *      "isPublic": true,
     *      "featured": false,
     *      "path": "/example",
     *      "enabled": true,
     *      "title": "This is a title",
     *      "description": "This is a description",
     *      "creatorUUID": "1eb9566f-1820-448c-9db6-27e6db18e7b7",
     *      "updatedAt": "2020-11-20T18:30:39.235Z",
     *      "createdAt": "2020-11-20T18:30:39.235Z"
     * }
     * 
     * @apiPermission permission.channels.canCreate
     * @apiVersion 1.0.0
     */
    async actionCreateOne(route) {
        let title = route.req.body.title
        let path = route.req.body.path
        let description = route.req.body.description

        const validationSchema = Joi.object({
            title: Joi.string().min(3).max(120).required(),
            path: Joi.string().min(3).max(16).required(),
            description: Joi.string().max(240)
        })

        let validation = await Validator.validate(validationSchema, {title, path, description})

        if(!validation.passed) {
            return validation.error
        }

        let channel = await Channel.create({
            title,
            path,
            description,
            creatorUUID: route.user.uuid
        })

        return channel
    }

    /**
     * @api {get} /channels/:id Get Channel 
     * @apiGroup Channels
     * @apiDescription Endpoint for getting channel information
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} id Channels unique ID.
     * 
     * @apiSuccess (200) {String} uuid Channels unique id
     * @apiSuccess (200) {String} title Channels title
     * @apiSuccess (200) {String} description Channels description
     * @apiSuccess (200) {String} creatorUUID Channels creator unique user id
     * @apiSuccess (200) {Array} playlist Channels playlist
     * @apiSuccess (200) {Timestamp} updatedAt Date of last update
     * @apiSuccess (200) {Timestamp} createdAt Date at which user was created
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "70c56c00-0bf9-4eb9-adfd-7a8ad3fb5a08",
     *      "title": "This is a title",
     *      "description": "This is a description",
     *      "createdAt": "2020-11-15T09:45:41.000Z",
     *      "updatedAt": "2020-11-15T09:45:41.000Z",
     *      "playlist": null,
     *      "creator": {
     *         "uuid": "f16cdbc3-6671-4835-9ccf-2123c6b470f3",
     *         "username": "admin"
     *      }
     * }
     * 
     * @apiError 404 The requested channel was not found.
     * @apiVersion 1.0.0
     */
    async actionGetOne(route) {
        let id = route.params.id

        // Specify what to return
        let options = {
            attributes: ['uuid', 'title', 'description', 'createdAt', 'updatedAt', 'isPublic', 'featured', 'enabled', 'path'],
            include: [
                {model: User, as: 'creator', attributes: ['uuid', 'username']}
            ]
        }

        // Define where clause
        let where = {
            uuid: id
        }

        // Check if user is permitted to see private channels
        let canSeePrivate = route.isOwnResource() || route.user && route.user.hasPermission('permission.channels.seePrivate')
        if(!canSeePrivate) {
            where.enabled = true
        }

        let playlist = await Channel.findOne({ where, ...options})
        return playlist
    }

    /**
     * @api {get} /channels Get multiple channels 
     * @apiGroup Channels
     * @apiDescription Endpoint for getting multiple channels. (Pagination available)
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiSuccess (200) {Integer} available Number of available entries in database (used to calc pages in frontend)
     * @apiSuccess (200) {Object} playlist Entry in returned array, holding a groups info
     * @apiSuccess (200) {String} playlist.uuid Playlists unique id
     * @apiSuccess (200) {String} playlist.title Playlists title
     * @apiSuccess (200) {String} playlist.description Playlists description
     * @apiSuccess (200) {String} playlist.creatorUUID Playlists creator unique user id
     * @apiSuccess (200) {Array} playlist.tracks Playlists list of tracks
     * @apiSuccess (200) {Timestamp} playlist.updatedAt Date of last update
     * @apiSuccess (200) {Timestamp} playlist.createdAt Date at which user was created
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "available": 1,
     *      "entries": [
     *          {
     *              "uuid": "d5b434c3-c287-4cbe-bb6e-26dd90b47fd3",
     *              "title": "Das ist eine Playlist",
     *              "description": "",
     *              "creatorUUID": "a495e477-2aa2-4fef-ad0c-6dbda6e59155",
     *              "tracks": "[]",
     *              "createdAt": "2020-11-13T11:25:11.000Z",
     *              "updatedAt": "2020-11-13T11:25:11.000Z"
     *          }
     *      ]
     * }
     * 
     * @apiPermission permission.channels.seePrivate
     * @apiVersion 1.0.0
     */
    async actionGetMultiple(route) {
        let offset = route.req.body.offset || 0
        let limit = route.req.body.limit || 1

        if(offset < 0) offset = 0
        if(limit > 30 || limit < 1) limit = 30

        // Specify what to return
        let options = {
            offset: offset,
            limit: limit,
            attributes: ['uuid', 'title', 'description', 'createdAt', 'updatedAt', 'isPublic', 'featured', 'enabled', 'path'],
            include: [
                {model: User, as: 'creator', attributes: ['uuid', 'username']}
            ]
        }

        // Define where clause
        let where = {}

        // Check if user is permitted to see private channels
        let canSeePrivate = route.user && route.user.hasPermission('permission.channels.seePrivate')
        if(!canSeePrivate) {
            where.enabled = true
        }

        let channels = await Channel.findAll({ where, ...options })
        let availableCount = 0

        // Output
        if(canSeePrivate) {
            availableCount = await Channel.findAndCountAll({ where: {}})
        } else {
            availableCount = await Channel.findAndCountAll({ where: { isPublic: true }})
        }
        return { available: availableCount.count, entries: channels }
    }

    /**
     * @api {delete} /channels/:id Delete Channel
     * @apiGroup Channels
     * @apiDescription Endpoint for deleting a channel
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * @apiParam {String} id Channels unique id
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {}
     * 
     * @apiPermission permission.channels.canDelete
     * @apiVersion 1.0.0
     */
    async actionRemoveOne(route) {
        let id = route.params.id

        let result = await Channel.destroy({where: { uuid: id }})
        if(result != 1) {
            return TrustedError.get("API_RESOURCE_NOT_DELETED")
        }

        return {}
    }

}

export default new ChannelEndpoint();
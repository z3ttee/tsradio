import Endpoint from './endpoint.js'
import Joi from 'joi'
import Validator from '../models/validator.js'
import { Channel } from '../models/channel.js'
import { Playlist } from '../models/playlist.js'
import { User } from '../models/user.js'

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
     * @apiParam {String} description Channels description (optional) (Max: 240).
     * @apiParam {String} playlist Channels playlist uuid (optional).
     * 
     * @apiExample json-body:
     * {
     *      "title": "This is a title",
     *      "description": "This is a description",
     *      "playlist": "d5b434c3-c287-4cbe-bb6e-26dd90b47fd3"
     * }
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
     *      "uuid": "053f2851-c351-421d-819b-2b7d95ed600b",
     *      "title": "This is a title",
     *      "description": "This is a description",
     *      "creatorUUID": "f16cdbc3-6671-4835-9ccf-2123c6b470f3",
     *      "updatedAt": "2020-11-15T09:35:37.711Z",
     *      "createdAt": "2020-11-15T09:35:37.711Z"
     * }
     * 
     * @apiPermission permission.channels.canCreate
     * @apiVersion 1.0.0
     */
    async actionCreateOne(route) {
        let title = route.req.body.title
        let description = route.req.body.description
        let playlistUUID = route.req.body.playlist

        const validationSchema = Joi.object({
            title: Joi.string().min(3).max(120).required(),
            description: Joi.string().max(240),
            playlistUUID: Joi.string().max(36)
        })

        let validation = await Validator.validate(validationSchema, {title, description, playlistUUID})

        if(!validation.passed) {
            return validation.error
        }

        let channel = await Channel.create({
            title,
            description,
            playlistUUID,
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

        let playlist = await Channel.findOne({ 
            where: { 
                uuid: id
            }, 
            attributes: ['uuid', 'title', 'description', 'createdAt', 'updatedAt'],
            include: [
                { model: Playlist, as: 'playlist', attributes: ['uuid', 'title']},
                { model: User, as: 'creator', attributes: ['uuid', 'username']}
            ]
        })
        return playlist
    }

    

}

export default new ChannelEndpoint();
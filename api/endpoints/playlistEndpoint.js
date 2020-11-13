import Endpoint from './endpoint.js'
import Joi from 'joi'
import Validator from '../models/validator.js'

import { Group } from '../models/group.js'
import { Playlist } from '../models/playlist.js'

class PlaylistEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
    }

    /**
     * @api {post} /users Create Playlist 
     * @apiGroup Playlists
     * @apiDescription Endpoint for creating new playlist
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} title Playlists title (required) (Min: 3, Max: 120).
     * @apiParam {String} description Playlists description (optional) (Max: 240).
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
     * @apiPermission permission.playlists.canCreate
     * @apiVersion 1.0.0
     */
    async actionCreateOne(route) {
        let title = route.req.body.title
        let description = route.req.body.description

        const validationSchema = Joi.object({
            title: Joi.string().min(3).max(120).required(),
            description: Joi.string().max(240),
        })

        let validation = await Validator.validate(validationSchema, {title, description})

        if(!validation.passed) {
            return validation.error
        }

        let playlist = await Playlist.create({
            title,
            description,
            creatorUUID: route.user.uuid
        })

        return playlist
    }

    /**
     * @api {get} /playlists/:id Get Playlist 
     * @apiGroup Playlists
     * @apiDescription Endpoint for getting playlist information
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} id Playlists unique ID.
     * 
     * @apiSuccess (200) {String} uuid Playlists unique id
     * @apiSuccess (200) {String} title Playlists title
     * @apiSuccess (200) {String} description Playlists description
     * @apiSuccess (200) {String} creatorUUID Playlists creator unique user id
     * @apiSuccess (200) {Array} tracks Playlists list of tracks
     * @apiSuccess (200) {Timestamp} updatedAt Date of last update
     * @apiSuccess (200) {Timestamp} createdAt Date at which user was created
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *      "uuid": "d5b434c3-c287-4cbe-bb6e-26dd90b47fd3",
     *      "title": "Das ist eine Playlist",
     *      "description": "",
     *      "creatorUUID": "a495e477-2aa2-4fef-ad0c-6dbda6e59155",
     *      "tracks": "[]",
     *      "createdAt": "2020-11-13T11:25:11.000Z",
     *      "updatedAt": "2020-11-13T11:25:11.000Z"
     * }
     * 
     * @apiError 404 The requested playlist was not found.
     * @apiVersion 1.0.0
     */
    async actionGetOne(route) {
        let id = route.params.id

        let playlist = await Playlist.findOne({ where: { uuid: id }})
        return playlist
    }

    /**
     * @api {get} /playlists Get multiple playlists 
     * @apiGroup Playlists
     * @apiDescription Endpoint for getting multiple playlists. (Pagination available)
     * 
     * @apiHeader {String} Authorization Users Bearer Token (JWT)
     * 
     * @apiParam {String} id Playlists unique ID.
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
     * @apiVersion 1.0.0
     */
    async actionGetMultiple(route) {
        let offset = route.req.body.offset || 0
        let limit = route.req.body.limit || 1

        if(offset < 0) offset = 0
        if(limit > 30 || limit < 1) limit = 30

        let playlists = await Playlist.findAll({
            offset: offset,
            limit: limit
        })

        let availableCount = await Playlist.findAndCountAll({ where: {}})
        return { available: availableCount.count, entries: playlists }
    }

}

export default new PlaylistEndpoint();
import Endpoint from './endpoint.js'
import Joi from 'joi'
import Validator from '../models/validator.js'
import bcrypt from 'bcrypt'
import config from '../config/config.js'

import { TrustedError } from '../error/trustedError.js'
import { Op } from 'sequelize'
import { User } from '../models/user.js'
import { Group } from '../models/group.js'
import { Playlist } from '../models/playlist.js'

class PlaylistEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
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
     * @apiSuccess (200) {String} title Playlists unique title
     * @apiSuccess (200) {String} description Playlists description
     * @apiSuccess (200) {Timestamp} createdAt Date at which playlist was created
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

        let playlist = await Playlist.findOne({
            where: { uuid: id }
        })

        return playlist
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

}

export default new PlaylistEndpoint();
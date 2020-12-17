import Endpoint from './endpoint.js'
import { getSong, getLyrics } from 'genius-lyrics-api'
import Joi from 'joi'
import Validator from '../models/validator.js'
import config from '../config/config.js'

class SongEndpoint extends Endpoint {

    constructor() {
        super({
            requiresAuth: true
        })
    }

    async actionLyrics(route) {
        let title = route.req.body.title
        let artist = route.req.body.artist

        console.log(route.req.body)

        const validationSchema = Joi.object({
            title: Joi.string().required(),
            artist: Joi.string().required()
        })

        let validation = await Validator.validate(validationSchema, {title, artist})

        if(!validation.passed) {
            return validation.error
        }

        let options = {
            title,
            artist,
            apiKey: config.genius.client_access_token,
            optimizeQuery: true
        }

        let lyrics = await getLyrics(options)

        if(!lyrics) {
            return
        } else {
            lyrics = lyrics.replaceAll('\n', "<br>")
            return {
                lyrics: lyrics
            }
        }
    }

}

export default new SongEndpoint();
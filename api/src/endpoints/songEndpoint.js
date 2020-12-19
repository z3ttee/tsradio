import Endpoint from './endpoint.js'
import { getLyrics } from 'genius-lyrics-api'
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

        const validationSchema = Joi.object({
            title: Joi.string().required(),
            artist: Joi.string().required()
        })

        // If multiple artists are present, choose the first
        artist = artist.split(",")[0] 

        // Normalize title (remove "Remaster" or anything like that)
        // Mostly such things appear after a -, so it can be filtered out easily
        title = title.split("-")[0]

        // There are cases where a remix name is inside brackets or a feat. is 
        // in title
        title = title.replace(/\((.*?)\)/, "")
        title = title.replace(/(?<=feat).*$/, "").replace("feat", "")

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
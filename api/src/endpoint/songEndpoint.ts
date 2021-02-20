import { Endpoint } from "./endpoint";
import { Router } from "../router";
import { Validator } from "../models/validator";
import { getLyrics } from 'genius-lyrics-api'

import config from '../config/config'
import Joi from 'joi'
import { TrustedError } from "../error/trustedError";

export default class AuthEndpoint extends Endpoint {

    constructor() {
        super(
            Endpoint.AuthenticationFlag.FLAG_NO_AUTH,
            []
        )
    }

    /**
    * @api {get} /songs/lyrics Get one channel
    */
    async actionGetLyrics(route: Router.Route): Promise<Endpoint.Result> {
        return new Promise<Endpoint.Result>(async (resolve) => {
            let title = route.body?.["title"]
            let artist = route.body?.["artist"]
    
            const validationSchema = Joi.object({
                title: Joi.string().required(),
                artist: Joi.string().required()
            })
    
            // If multiple artists are present, choose the first
            artist = artist.split(",")[0] 
    
            // Normalize title (remove "Remaster" or anything like that)
            // Mostly such things appear after a -, so it can be filtered out easily
            title = title.split("-")[0]
    
            // There are cases where a remix name is inside brackets or a (feat.) is 
            // in title
            title = title.replace(/\((.*?)\)/, "")
            title = title.replace(/(?<=feat).*$/, "").replace("feat", "")
    
            let validationResult = await Validator.validate(validationSchema, {title, artist})
    
            if(!validationResult.hasPassed()) {
                return validationResult.getError()
            }
    
            let options = {
                title,
                artist,
                apiKey: config.genius.client_access_token,
                optimizeQuery: false
            }
    
            getLyrics(options)
                .then((result) => resolve(new Endpoint.ResultSingleton(200, result)))
                .catch(() => resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)))
        })
    }
}
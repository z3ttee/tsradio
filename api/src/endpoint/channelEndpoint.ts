import { Member } from "../alliance/member";
import { TrustedError } from "../error/trustedError";
import { Channel } from "../models/channel";
import { Router } from "../router";
import { Endpoint } from "./endpoint";
import { Op } from "sequelize"

export default class ChannelEndpoint extends Endpoint {

    constructor() {
        super(
            Endpoint.AuthenticationFlag.FLAG_REQUIRED,
            [
                new Endpoint.Permission("createOne", "permission.channels.create"),
                new Endpoint.Permission("deleteOne", "permission.channels.delete"),
                new Endpoint.Permission("updateOne", "permission.channels.update")
            ]
        )
    }

    /**
    * @api {get} /channels/:uuid Get one channel
    */
    async actionGetOne(route: Router.Route): Promise<Endpoint.Result> {
        let targetUUID = route.params?.["uuid"] || ""
        let whereClause = { 
            uuid: targetUUID,
            activeSince: {
                [Op.not]: null
            }
        }

        if(route.member instanceof Member) {
            if(route.member.hasPermission("permission.channels.read")) {
                delete whereClause.activeSince
            }
        }

        let channel = await Channel.findOne({ where: whereClause })
        if(!channel) {
            return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
        } else {
            return new Endpoint.ResultSingleton(200, channel)
        }
    }

    /**
    * @api {get} /channels/:filter Get all channels
    */
    async actionGetAll(route: Router.Route): Promise<Endpoint.Result> {
        let filter = route.params?.["filter"]?.toLowerCase() || "active"
        let whereClause = {
            activeSince: {
                [Op.not]: null
            }
        }

        if(filter == "all" && route.member instanceof Member) {
            if(route.member.hasPermission("permission.channels.read")) {
                delete whereClause.activeSince
            }
        }

        let channel = await Channel.findOne({
            where: whereClause
        })

        if(!channel) {
            return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
        } else {
            return new Endpoint.ResultSingleton(200, channel)
        }
    }

    /**
     * @api {post} /channels Create channel
     */
    async actionCreateOne(route: Router.Route): Promise<Endpoint.Result> {
        if(route.member instanceof Member) {
            const title = route.body?.["title"]
            const description = route.body?.["description"] || undefined
            const mountpoint = route.body?.["mountpoint"]
            const creatorId = route.member?.uuid
            const enabled = (route.body?.["enabled"] == undefined ? true : route.body?.["enabled"])
            const featured = !!route.body?.["featured"]
            const lyricsEnabled = (route.body?.["lyricsEnabled"] == undefined ? true : route.body?.["lyricsEnabled"])
            const colorHex = route.body?.["colorHex"] || undefined

            const channel = await Channel.createChannel(
                title,
                mountpoint,
                description,
                creatorId,
                enabled,
                featured,
                lyricsEnabled,
                colorHex
            )

            return channel
        }

        return new Endpoint.ResultEmpty(400)
    }

    /**
     * @api {put} /channels/:uuid Update channel
     */
    async actionUpdateOne(route: Router.Route): Promise<Endpoint.Result> {
        if(route.member instanceof Member) {
            const targetUUID = route.params?.["uuid"] || ""

            const title = route.body?.["title"] || undefined
            const description = route.body?.["description"] || undefined
            const creatorId = route.body?.["creatorId"] || undefined
            const enabled = (route.body?.["enabled"] == undefined ? undefined : route.body?.["enabled"])
            const featured = (route.body?.["featured"] == undefined ? undefined : route.body?.["featured"])
            const lyricsEnabled = (route.body?.["lyricsEnabled"] == undefined ? undefined : route.body?.["lyricsEnabled"])
            const colorHex = route.body?.["colorHex"] || undefined

            const channel = await Channel.updateChannel(targetUUID, {
                title,
                description,
                creatorId,
                enabled,
                featured,
                lyricsEnabled,
                colorHex
            })

            return channel
        }

        return new Endpoint.ResultEmpty(400)
    }


    /**
     * @api {delete} /channels Delete channel
     */
    async actionDeleteOne(route: Router.Route): Promise<Endpoint.Result> {
        if(route.member instanceof Member) {
            let targetUUID = route.params?.["uuid"] || ""

            let affectedRows = await Channel.destroy({ 
                where: { uuid: targetUUID }
            })
    
            if(affectedRows == 0) {
                return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
            } else {
                return new Endpoint.ResultSingleton(200, undefined)
            }
        }

        return new Endpoint.ResultEmpty(400)
    }

}
import { Member } from "../alliance/member";
import { TrustedError } from "../error/trustedError";
import { Channel } from "../models/channel";
import { Router } from "../router";
import { Endpoint } from "./endpoint";
import { Op } from "sequelize"
import ChannelHandler from "../handler/channelHandler";

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

        if(ChannelHandler.isStreaming(targetUUID)) {
            // TODO: Send channel with info as response
            const c = ChannelHandler.getChannel(targetUUID)
            const channel = {
                ...c["dataValues"],
                info: c.channelInfo
            }

            return new Endpoint.ResultSingleton(200, channel)
        } else {
            if(route.member instanceof Member && route.member.hasPermission("permission.channels.read")) {
                let channel = await Channel.findOne({ where: { uuid: targetUUID }})
                return new Endpoint.ResultSingleton(200, channel)
            } else {
                return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
            }
        }
    }

    /**
    * @api {get} /channels Get all channels
    */
    async actionGetAll(route: Router.Route): Promise<Endpoint.Result> {
        let activeChannels = []
        Object.values(ChannelHandler.channels).filter((element: Channel) => element && element.channelState == Channel.ChannelState.STATE_STREAMING).forEach((channel: Channel) => {
            activeChannels.push({
                ...channel["dataValues"],
                info: channel.channelInfo
            })
        })
        let inactiveChannels = Object.values(ChannelHandler.channels).filter((element: Channel) => element && element.channelState != Channel.ChannelState.STATE_STREAMING)

        let channels = [
            ...activeChannels
        ]

        if(route.member instanceof Member && route.member.hasPermission("permission.channels.read")) {
            channels.push(...inactiveChannels)
        }

        return new Endpoint.ResultSet(200, channels, channels.length)
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
            const mountpoint = route.body?.["mountpoint"] || undefined
            const description = route.body?.["description"] || undefined
            const creatorId = route.body?.["creatorId"] || undefined
            const enabled = (route.body?.["enabled"] == undefined ? undefined : route.body?.["enabled"])
            const featured = (route.body?.["featured"] == undefined ? undefined : route.body?.["featured"])
            const lyricsEnabled = (route.body?.["lyricsEnabled"] == undefined ? undefined : route.body?.["lyricsEnabled"])
            const colorHex = route.body?.["colorHex"] || undefined

            console.log(mountpoint)

            const channel = await Channel.updateChannel(targetUUID, {
                title,
                mountpoint,
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
            return Channel.deleteChannel(targetUUID)
        }

        return new Endpoint.ResultEmpty(400)
    }

}
import { Endpoint } from "./endpoint";
import { Router } from "../router";
import { TrustedError } from "../error/trustedError";
import { MediaUtil } from "../utils/mediaUtil";
import { Channel } from "../models/channel";

export default class CoverEndpoint extends Endpoint {

    constructor() {
        super(
            Endpoint.AuthenticationFlag.FLAG_NO_AUTH,
            [
                { endpointAction: "setOne", permission: "permission.covers.set" },
                { endpointAction: "deleteOne", permission: "permission.covers.delete" }
            ]
        )

        MediaUtil.setupUploadDirectory()
    }

    /**
     * @api {get} /covers/:hash Get avatar
     */
    async actionGetOne(route: Router.Route): Promise<Endpoint.Result> {
        let file = MediaUtil.getCoverFileByHash(route.params?.["hash"])

        // Send cover
        MediaUtil.sendFileAsResponse(file, route.response);

        // Return response
        let response = new Endpoint.ResultEmpty(200)
        response.renderFormat = "IMAGE"
        return response   
    }

    /**
     * @api {post} /covers/:uuid Set avatar
     */
    async actionSetOne(route: Router.Route): Promise<Endpoint.Result> {
        return new Promise<Endpoint.Result>((resolve) => {
            let targetUUID = route.params?.["uuid"]

            let busboy = route.request["busboy"]
            if(!busboy) {
                return TrustedError.get(TrustedError.Errors.MISSING_ATTACHMENTS)
            }

            Channel.findOne({ where: { uuid: targetUUID }}).then((channel) => {
                if(!channel) {
                    return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
                }

                route.request.pipe(busboy)
                busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                    MediaUtil.createCoverImage(channel, mimetype)
                        .then((result) => resolve(result))
                        .catch((error) => resolve(error))
                })
            }).catch((error) => {
                console.log(error)
                resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
            })
        })
    }

    /**
     * @api {delete} /covers/:uuid Delete Cover
     */
    async actionDeleteOne(route: Router.Route): Promise<Endpoint.Result> {
        let targetUUID = route.params?.["uuid"]

        let channel = await Channel.findOne({ where: { uuid: targetUUID }})
        if(!channel) {
            return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
        }

        return MediaUtil.deleteCover(channel)
    }

}
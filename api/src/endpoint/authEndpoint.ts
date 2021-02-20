import { Alliance } from "../alliance/alliance";
import { TrustedError } from "../error/trustedError";
import ChannelHandler from "../handler/channelHandler";
import { Router } from "../router";
import { SocketHandler } from "../sockets/socketHandler";
import { Endpoint } from "./endpoint";

export default class AuthEndpoint extends Endpoint {

    constructor() {
        super(
            Endpoint.AuthenticationFlag.FLAG_NO_AUTH,
            []
        )
    }

    /**
    * @api {get} /channels/:uuid Get one channel
    */
    async actionListenerLogin(route: Router.Route): Promise<Endpoint.Result> {
        try {
            let mountpoint = route.body?.["mount"]
            console.log(mountpoint)

            let path = mountpoint.split("?")[0]
            let query = mountpoint.split("?")[1].split("&")

            let token = query[0]
            let channelUUID = query[1]

            let member = await Alliance.getInstance().authenticateMemberByToken(token)

            if(member instanceof TrustedError) {
                return member
            } else {
                if(member == null) {
                    return TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
                }
            }

            route.response.set('icecast-auth-user', '1');
            ChannelHandler.moveMemberToChannel(SocketHandler.getInstance().getSocketMemberByMemberId(member.uuid), channelUUID)
            return new Endpoint.ResultEmpty(200)
        } catch (exception) {
            let error = TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
            route.response.set('icecast-auth-user', '0');
            route.response.set('Icecast-Auth-Message', error.message.toString());
            return error
        }
        
    }
}
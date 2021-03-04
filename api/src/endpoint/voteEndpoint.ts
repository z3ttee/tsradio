import { Member } from "../alliance/member";
import { TrustedError } from "../error/trustedError";
import ChannelHandler from "../handler/channelHandler";
import { VoteHandler } from "../handler/voteHandler";
import { Router } from "../router";
import { Endpoint } from "./endpoint";

export default class VoteEndpoint extends Endpoint {

    constructor() {
        super(
            Endpoint.AuthenticationFlag.FLAG_REQUIRED,
            []
        )
    }

    /**
     * @api {put} /votes/:uuid/add Submit Vote
     */
    async actionAddVote(route: Router.Route): Promise<Endpoint.Result> {
        var targetUUID = route.params?.["uuid"]
        var voteCategory = parseInt(route.body?.["category"])
        var value = route.body?.["value"]

        if(!ChannelHandler.isStreaming(targetUUID)) {
            return TrustedError.get(TrustedError.Errors.RESOURCE_NOT_FOUND)
        }

        if(VoteHandler.hasCooldown(targetUUID)) {
            return TrustedError.get(TrustedError.Errors.VOTE_COOLDOWN)
        }

        if(VoteHandler.hasVoted(targetUUID, (route.member as Member).uuid)) {
            return TrustedError.get(TrustedError.Errors.ALREADY_VOTED)
        }

        // For category "skip": Values should be true / false
        VoteHandler.addVote(targetUUID, voteCategory as VoteHandler.VoteCategory, (route.member as Member).uuid, value)
        return new Endpoint.ResultEmpty(200)
    }
    
}
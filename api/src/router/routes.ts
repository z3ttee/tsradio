import ChannelEndpoint from "../endpoint/channelEndpoint"
import AuthEndpoint from "../endpoint/authEndpoint"
import SongEndpoint from "../endpoint/songEndpoint"

import { Endpoint } from "../endpoint/endpoint"
import CoverEndpoint from "../endpoint/coverEndpoint"
import VoteEndpoint from "../endpoint/voteEndpoint"

export namespace Routes {
    export const list: Array<RouteGroup> =  [
        {
            handler: ChannelEndpoint,
            groupname: "channels",
            routes: [
                { name: 'ChannelCreateOne', path: '/channels', method: 'post', action: 'createOne' },
                { name: 'ChannelDeleteOne', path: '/channels/:uuid', method: 'delete', action: 'deleteOne' },
                { name: 'ChannelGetOne', path: '/channels/:uuid', method: 'get', action: 'getOne' },
                { name: 'ChannelGetAll', path: '/channels', method: 'get', action: 'getAll' },
                { name: 'ChannelUpdateOne', path: '/channels/:uuid', method: 'put', action: 'updateOne' }
            ]
        },
        {
            handler: AuthEndpoint,
            groupname: "auth",
            routes: [
                { name: 'AuthListener', path: '/auth/listener', action: 'listenerLogin', method: 'post' }
            ]
        },
        {
            
            handler: SongEndpoint,
            groupname: 'songs',
            routes: [
                { name: 'SongGetLyrics', path: '/songs/lyrics', action: 'getLyrics', method: 'post' },
            ]
        },
        {
            handler: CoverEndpoint,
            groupname: 'covers',
            routes: [
                { name: 'CoverGet', path: '/covers/:type/:cover', action: 'getOne', method: 'get'},
                { name: 'CoverSet', path: '/covers/channel/:type/:uuid', action: 'setOne', method: 'post'},
                { name: 'CoverDelete', path: '/covers/channel/:uuid', action: 'deleteOne', method: 'delete'}
            ]
        },
        {
            handler: VoteEndpoint,
            groupname: 'votes',
            routes: [
                { name: 'VoteAdd', path: '/votes/:uuid/add', action: 'addVote', method: 'put'}
            ]
        },
    ]

    /**
     * Only used to define routing groups
     */
    export class RouteGroup {
        public readonly handler: { new(): Endpoint }
        public readonly groupname: String
        public readonly routes: Array<Route> = []

        constructor(handler: { new(): Endpoint }, groupname: String) {
            this.handler = handler
            this.groupname = groupname
        }
    }

    /**
     * Only used to define routes
     */
    export class Route {
        public readonly name: String
        public readonly path: String
        public readonly action: String
        public readonly method: String
        public readonly meta?: String

        constructor(name: String, path: String, action: String, method: String) {
            this.name = name
            this.path = path
            this.action = action
            this.method = method
        }
    }
}

import { TrustedError } from '../error/trustedError.js'
import Authenticator from '../models/authenticator.js'
import { Channel } from '../models/channel.js'
import { Playlist } from '../models/playlist.js'
import { User } from '../models/user.js'
import routes from './routes.js'

class Router {

    constructor() {
        this.routes = routes
        this.ownResourceRequest = false
    }

    async setup(app) {
        this.app = app

        for(let group of this.routes) {
            for(let action of group.actions) {
                this.app[action.method.toLowerCase()](action.path, async (req, res) => {
                    let handler = group.handler
                    let actionFunc = 'action'+action.action.charAt(0).toUpperCase()+action.action.slice(1)
                    let authenticator = await Authenticator.validateJWT(req)

                    this.currentRoute = {groupname: group.groupname, ...action, req, res, params: req.params, handler}

                    // Authenticate user when jwt is provided
                    if(!authenticator.passed && handler.requiresAuth) {
                        if(authenticator.error) {
                            TrustedError.send(authenticator.error, res)
                        } else {
                            TrustedError.send(["API_AUTH_REQUIRED","API_JWT_INVALID"], res)
                        }
                        return
                    }

                    if(authenticator.data) {
                        this.currentRoute.user = authenticator.data
                    }

                    // Check if action requires permission, throw error if user is not permitted
                    if(action.permission && !authenticator.passed) {
                        if(!authenticator.data) {
                            TrustedError.send("API_ACCOUNT_NOT_FOUND", res)
                            return
                        }

                        const hasPermission = await authenticator.data.hasPermission(action.permission)
                        if(!hasPermission && !await this.isOwnResource()) {
                            TrustedError.send("API_NO_PERMISSION", res)
                            return
                        }
                    }

                    this.currentRoute.isOwnResource = () => { return this.ownResourceRequest }

                    // Execute action
                    handler[actionFunc](this.currentRoute).then((result) => {
                        if(!result) {
                            res.status(404).json({})
                        } else {
                            res.status(result.code || 200).json(result)
                        }
                    })
                })

            }
        }
    }

    async isOwnResource(){
        let result = false

        try {
            let ownID = this.currentRoute.user.uuid
            let resourceID = this.currentRoute.params.id
            let endpointGroup = this.currentRoute.groupname

            if(endpointGroup == 'users') {
                if(resourceID == '@me') return true
                
                let requestedResource = await User.findOne({ where: { uuid: resourceID }, attributes: ['uuid']})
                this.currentRoute.resource = requestedResource
                result = requestedResource.uuid == ownID
            } else if(endpointGroup == 'playlists') {
                if(resourceID == '@me') return true

                let requestedResource = await Playlist.findOne({ where: { creatorUUID: ownID }, attributes: ['uuid']})
                this.currentRoute.resource = requestedResource
                result = requestedResource.uuid == resourceID
            } else if(endpointGroup == 'channels') {
                if(resourceID == '@me') return true

                let requestedResource = await Channel.findOne({ where: { creatorUUID: ownID }, attributes: ['uuid']})
                this.currentRoute.resource = requestedResource
                result = requestedResource.uuid == resourceID
            }
        } catch (exception) {
            result = false
        }

        this.ownResourceRequest = result
        return result
    }
}

export default new Router()
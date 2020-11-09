import { TrustedError } from '../error/trustedError.js'
import Authenticator from '../models/authenticator.js'
import routes from './routes.js'

class Router {

    constructor(app) {
        this.routes = routes
        this.app = app
    }

    async setup() {
        for(let group of this.routes) {
            for(let action of group.actions) {

                this.app[action.method.toLowerCase()](action.path, async (req, res) => {
                    let handler = group.handler
                    let actionFunc = 'action'+action.action.charAt(0).toUpperCase()+action.action.slice(1)
                    let authenticator = await Authenticator.authenticateJWT(req)

                    this.currentRoute = {...action, req, res, params: req.params}


                    // Authenticate user when jwt is provided
                    if(!authenticator.passed && handler.requiresAuth) {
                        TrustedError.send(["API_AUTH_REQUIRED","API_JWT_INVALID"], res)
                        return
                    }

                    if(authenticator.data) {
                        this.currentRoute.user = authenticator.data
                    }

                    if(action.permission && (!authenticator.passed || !await authenticator.data.hasPermission(action.permission))) {
                        TrustedError.send("API_NO_PERMISSION", res)
                        return
                    }

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
}

export default Router
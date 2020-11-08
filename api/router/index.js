import { TrustedError } from '../error/trustedError.js'
import Authenticator from '../models/authenticator.js'
import routes from './routes.js'

class Router {

    constructor(app) {
        this.routes = routes
        this.app = app
    }

    setup() {
        for(let group of this.routes) {
            for(let action of group.actions) {

                this.app[action.method.toLowerCase()](action.path, (req, res) => {
                    let handler = group.handler
                    let actionFunc = 'action'+action.action.charAt(0).toUpperCase()+action.action.slice(1)
                    let authenticator = Authenticator.authenticateJWT(req)

                    this.currentRoute = {...action, req, res, params: req.params}

                    // Authenticate user when jwt is provided
                    if(!authenticator.passed && handler.requiresAuth) {
                        TrustedError.send(["API_AUTH_REQUIRED","API_JWT_INVALID"], res)
                        return
                    }

                    if(authenticator.data) {
                        this.currentRoute.user = authenticator.data
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
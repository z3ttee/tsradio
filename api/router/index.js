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

                    // Authenticate user, if required by endpoint, using provided jwt
                    let authenticated = handler.requiresAuth ? new Authenticator().authenticateJWT(req) : true
                    this.currentRoute = {...action, req, res, params: req.params, authenticated}
                    let actionFunc = 'action'+action.action.charAt(0).toUpperCase()+action.action.slice(1)

                    res.setHeader('Content-Type', 'application/json');

                    if(handler.requiresAuth && !authenticated) {
                        res.end(new TrustedError(res, "API_AUTH_REQUIRED").toJSON())
                    } else {
                        handler[actionFunc](this.currentRoute).then((result) => {
                            if(!result) {
                                res.status(404).end(JSON.stringify({}))
                            } else {
    
                                if(result instanceof TrustedError) {
                                    throw result
                                    //res.end(JSON.stringify(result.getAsJSON()))
                                } else {
                                    res.end(JSON.stringify(result))
                                }
                            }
                            
                        })
                    }
                })

            }
        }
    }
}

export default Router
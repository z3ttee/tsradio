import { ApiError } from '../models/error.js'
import routes from './routes.js'

class Router {

    constructor() {
        this.endpoints = routes
        this.routes = {}
    }

    use(app) {

        for(var endpoint of this.endpoints) {

            for(var route of endpoint.paths) {

                
                if(!route.method) route.method = 'GET'
            
                if(this.routes[route.name.toLowerCase()]) {
                    console.warn('> WARN: A route named ['+route.name.toLowerCase()+'] already exists! Ensure that each route is unique!')
                } else {
                    this.routes[route.name.toLowerCase()] = route
                }

                //console.log(app[route.method.toLowerCase()])
                //console.log(route.path)

                console.log('Registering route '+route.name, route.path)

                app[route.method.toLowerCase()](route.path, (req, res) => {
                    console.log(route.method, req.method)

                    const action = 'action'+route.action.charAt(0).toUpperCase()+route.action.slice(1) 

                    res.end(action)
                    /*const handler = endpoint.handler
                    // Refactor action to match function naming scheme
                    const action = 'action'+route.action.charAt(0).toUpperCase()+route.action.substr(1, route.action.length)        
                    
                    this.currentRoute = {...route, req, res, params: req.params}
                    handler[action](this.currentRoute).then((result) => {
                        res.setHeader('Content-Type', 'application/json');

                        if(!result) {
                            res.end(JSON.stringify({}))
                        } else {
                            if(result instanceof ApiError) {
                                res.end(JSON.stringify(result.getAsJSON()))
                            } else {
                                res.end(JSON.stringify(result))
                            //}
                        }
                        
                    })*/
                })
            }
        }
    }

}

export default new Router()
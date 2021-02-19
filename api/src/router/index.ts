import { Routes } from './routes'
import Express, { Request, Response } from 'express'
import { TrustedError } from '../error/trustedError'
import { Endpoint } from '../endpoint/endpoint'

import bodyParser from 'body-parser'
import cors from 'cors'
import busboy from 'connect-busboy'
import { ValidationError } from '../error/validationError'
import { Member } from '../account/member'

export class Router {
    private static instance: Router = undefined

    private routes: Array<Routes.RouteGroup> = Routes.list
    private expressApp = Express()
    
    /**
     * Initialize route.
     * This registers all routes and adds them to express instance
     */
    constructor() {
        this.expressApp.use(bodyParser.urlencoded({ extended: true }))
        this.expressApp.use(bodyParser.json())
        this.expressApp.use(cors())
        this.expressApp.use(busboy())

        for(let group of this.routes) {
            for(let route of group.routes) {
                this.expressApp[route.method.toLowerCase()](route.path, async (request: Request, response: Response) => {
                    let actionHandler: Endpoint = new group.handler()
                    let actionFunction: string = 'action'+route.action.charAt(0).toUpperCase()+route.action.slice(1)

                    let member: Member | TrustedError = await Member.authenticateRequest(request)
                    let requiresAuth = this.isRequiringAuthentication(actionHandler, route, request.params)

                    // Check if account is successfully authenticated if route requires authentication
                    if(!member || member instanceof TrustedError && requiresAuth) {
                        this.sendErrorResponse(response, member as TrustedError)
                        return
                    }

                    // Define current route
                    let currentRoute = new Router.Route(group, route.name, route.path, route.action, member, request, response)
                    currentRoute.isOwnResource = this.isOwnResourceRequest(currentRoute)
                    this.translateScopes(currentRoute)

                    if(!(member instanceof TrustedError) && !member?.hasPermission(currentRoute.permission, currentRoute) && requiresAuth) {
                        this.sendErrorResponse(response, TrustedError.get(TrustedError.Errors.PERMISSION_DENIED))
                        return
                    }

                    // Check if action of route exists
                    if(!actionHandler[actionFunction]) {
                        this.sendErrorResponse(response, TrustedError.get(TrustedError.Errors.UNKNOWN_ROUTE))
                        return
                    }

                    try {
                        // Execute action of requested route
                        actionHandler[actionFunction](currentRoute).then(async(result: Endpoint.Result = { statusCode: 200, renderFormat: "JSON" }) => {
                            let renderFormat = result.renderFormat
                            result.renderFormat = undefined

                            if(renderFormat === "JSON") {
                                if(result instanceof Endpoint.ResultSingleton) {
                                    response.status(result.statusCode).json({ statusCode: result.statusCode, data: result.data })
                                } else if(result instanceof Endpoint.ResultSet) {
                                    response.status(result.statusCode).json({ statusCode: result.statusCode, available: result.available, entries: result.entries })
                                } else if(result instanceof TrustedError || result instanceof ValidationError){
                                    this.sendErrorResponse(response, result)
                                } else {
                                    this.sendResponse(response, result)
                                }
                            }
                        }).catch((error) => {
                            if(!(error instanceof TrustedError)) console.error(error)
                            this.sendErrorResponse(response, TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
                        })
                    } catch (error) {
                        if(!(error instanceof TrustedError)) console.error(error)
                        this.sendErrorResponse(response, TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
                    }
                })
            }
        }

        this.setCatchAllRoute()
    }

    /**
     * Register a route that catches every route, that was not registered before to prevent unwanted errors
     */
    private setCatchAllRoute() {
        this.expressApp.use(async(request, response, next) => {
            console.warn("Could not "+request.method+" route "+request.originalUrl)
            this.sendErrorResponse(response, TrustedError.get(TrustedError.Errors.UNKNOWN_ROUTE))
        })
    }

    /**
     * Getting the initialized express instance with all routes setup
     * @returns {Express.Application} Express instance
     */
    public getExpressInstance(): Express.Application {
        return this.expressApp
    }

    /**
     * Send an error response to requester
     * @param response Express response
     * @param error TrustedError instance
     */
    private sendErrorResponse(response, error: Endpoint.Result) {
        if(!error) {
            error = TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
        }

        response.status(error.statusCode).json(error).end()
    }

    /**
     * Send a response to requester
     * @param response Express response
     * @param result Endpoint result object
     */
    private sendResponse(response, result: Endpoint.Result) {
        if(!result) {
            result = new Endpoint.ResultEmpty(200)
        }

        response.status(result.statusCode).json(result).end()
    }

    /**
     * Translate scopes in request parameters to actual values
     * @param route Route for which the translation should be processed
     * @returns {Router.Route} Route containing translated parameters
     */
    private translateScopes(route: Router.Route): Router.Route {
        for(let prop in route.params) {
            if(route.params[prop] === "@me") {
                route.params[prop] = route.member?.["uuid"]
            }
        }

        return route
    }

    /**
     * Function for checking if a route needs a requester to be authenticated
     * @param {Object} handler Handler of the endpoint
     * @param {Object} action Action object
     * @param {Object} params Params from url query
     * @returns {Boolean} True or False
     */
    isRequiringAuthentication(handler: Endpoint, route: Routes.Route, params: Object): Boolean {
        // Check if whole handler needs authentication
        let requiringAuth = handler.getAuthenticationFlag() === Endpoint.AuthenticationFlag.FLAG_REQUIRED

        // Return if auth is required
        if(requiringAuth) return true

        // Check if request url contains an @me scope, so a user account is needed to resolve uuid for @me
        let hasSelfScope = false
        for(let param in params) {
            if(params[param] == '@me') {
                hasSelfScope = true
                break
            }
        }

        // Return if has @me scope
        if(hasSelfScope) return true

        // Check if action requires any permission and return
        return !!handler.getPermissions().find((permission) => permission.endpointAction === route.action)
    }

    isOwnResourceRequest(route: Router.Route): Boolean {
        return route.params && Object.values(route.params).includes("@me")
    }

    /**
     * Get global instance of router
     * @returns {Router} Router instance
     */
    static getInstance(){
        if(!this.instance) {
            this.instance = new Router()
        }
        return this.instance
    }
}

export namespace Router {

    /**
     * Only used for internal usage, not recommended to use in routes definition.
     * For defining routes, use Route class from routes.ts
     */
    export class Route {
        public readonly group: Routes.RouteGroup
        public readonly name: String
        public readonly path: String
        public readonly member: Member | TrustedError
        public readonly action: String
        public readonly request: Request
        public readonly response: Response
        public readonly body?: object
        public readonly query?: Object
        public readonly permission?: String

        public isOwnResource: Boolean
        public params?: Object

        constructor(group: Routes.RouteGroup, name: String, path: String, action: String, member: Member | TrustedError, request: Request, response: Response) {
            this.group = group
            this.name = name
            this.path = path
            this.action = action
            this.member = member
            this.request = request
            this.response = response
            this.body = this.request.body
            this.query = this.request.query
            this.params = this.request.params
            this.isOwnResource = this.ownResource()

            this.permission = new group.handler().getPermissions().find((permission) => permission.endpointAction === this.action)?.permission || undefined
        }

        /**
         * Check if the requested resource is owned by the requester.
         * @returns {Boolen} True or False
         */
        private ownResource() {
            try {
                return this.params?.["uuid"] == this.member["uuid"]
            } catch (error) {
                return false
            }
        }
    }

    /**
     * Class used for storing value for a specific scope
     * Used when translating scope params on routing
     */
    export class Parameter {
        public readonly name: String
        public readonly value: String

        constructor(name: String, value: String) {
            this.name = name
            this.value = value
        }
    }
}
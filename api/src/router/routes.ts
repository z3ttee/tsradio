import { Endpoint } from "../endpoint/endpoint"

export namespace Routes {
    export const list: Array<RouteGroup> =  [
        
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

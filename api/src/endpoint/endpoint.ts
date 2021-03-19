export abstract class Endpoint {

    private authFlag: Endpoint.AuthenticationFlag;
    private permissions: Array<Endpoint.Permission>;

    constructor(authFlag: Endpoint.AuthenticationFlag = Endpoint.AuthenticationFlag.FLAG_NO_AUTH, permissions: Array<Endpoint.Permission> = []){
        this.authFlag = authFlag
        this.permissions = permissions
    }

    /**
     * Check wether an endpoint requires authentication or not
     */
    isRequiringAuthentication() {
        return this.authFlag === Endpoint.AuthenticationFlag.FLAG_REQUIRED
    }

    /**
     * Get a list of permissions for certain actions on an endpoint
     */
    getPermissions(){
        return this.permissions
    }

    /**
     * Get flag for authentication
     */
    getAuthenticationFlag() {
        return this.authFlag
    }
}



export namespace Endpoint {
    export class Permission {
        public endpointAction: String
        public permission: String

        constructor(endpointAction: String, permission: String) {
            this.endpointAction = endpointAction
            this.permission = permission
        }
    }

    export enum AuthenticationFlag {
        FLAG_REQUIRED = 1,
        FLAG_NO_AUTH
    }
    
    export abstract class Result {
        public statusCode: number = 200
        public renderFormat: string = "JSON"
    }
    export class ResultSingleton extends Result {
        public data: any

        constructor(statusCode: number, data: any) {
            super()
            this.statusCode = statusCode
            this.data = data
        }
    }
    export class ResultSet extends Result {
        public entries: Array<any>
        public available: number

        constructor(statusCode: number, entries: Array<any>, available: number) {
            super()
            this.statusCode = statusCode
            this.entries = entries
            this.available = available
        }
    }
    export class ResultEmpty extends Result {
        constructor(statusCode: number) {
            super()
            this.statusCode = statusCode
        }
    }
}
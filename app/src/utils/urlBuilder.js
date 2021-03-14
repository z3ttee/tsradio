import config from '@/config/config'

export class UrlBuilder {

    /**
     * Build the api base url
     * @returns String
     */
     static buildAllianceBase() {
        return config.authService.protocol+"://"+config.authService.host + (config.authService.port != 0 ? ":" + config.authService.port : "")
    }

    /**
     * Build the api base url
     * @returns String
     */
    static buildApiBase() {
        return config.api.protocol+"://"+config.api.host + (config.api.port != 0 ? ":" + config.api.port : "") + config.api.path
    }

    /**
    * Build the api base url
    * @returns String
    */
    static buildCoverBase() {
        return this.buildApiBase() + "/covers"
    }

    /**
     * Build the api base url
     * @returns String
     */
     static buildAvatarBase() {
        return this.buildAllianceBase() + "/avatars/"
    }

    /**
    * Build the api base url
    * @returns String
    */
     static buildStreamBase() {
        return (process.env.NODE_ENV == "development") ? "https://radio.tsalliance.eu/streams" : window.origin + "/streams"
    }

    /**
     * Build the connection endpoint for a socket connection
     * @returns Json Object
     */
    static buildSocketEndpoint() {
        return {
            url: config.api.protocol+"://"+config.api.host + (config.api.port != 0 ? ":" + config.api.port : ""),
            path: config.api.path + "/socket.io"
        }
    }

    /**
     * Build the connection endpoint for a socket connection
     * @returns Json Object
     */
     static buildAuthFormEndpoint() {
        return config.authForm.url + "?redirect=" + config.authForm.redirectCode
    }

}
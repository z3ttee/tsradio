import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { Account } from '@/models/account.js'
import { Modal } from '@/models/modal.js'

export class Api {

    constructor() {
        axios.defaults.baseURL = this.getApiUrl()
    }

    /**
     * Send a get request to the api
     * @param path Endpoint path
     * @param query Query parameters
     * @returns {Api.Result} Api Result
     */
    async get(path, query = {}, handleError = false, isAlliance = false) {
        let baseURL = isAlliance ? this.getAllianceUrl() : this.getApiUrl()
        
        return new Promise((resolve) => {
            axios.request({
                baseURL,
                headers: { 'Authorization': "Bearer "+store.state.account.session },
                url: path + (query && Object.keys(query).length > 0 ? "?" + this.objectToUrlQuery(query) : ""),
                method: 'GET'
            }).then((response) => resolve(this.transformAxiosResponse(response, handleError)))
            .catch((error) => resolve(this.transformAxiosError(error, handleError)))
        })
    }

    /**
     * Send a post request to the api
     * @param path Endpoint path
     * @param data Body data in json
     * @returns {Api.Result} Api Result
     */
    async post(path, data = {}, handleError = false, isAlliance = false) {
        let baseURL = isAlliance ? this.getAllianceUrl : this.getApiUrl()

        return new Promise((resolve) => {
            axios.request({
                baseURL,
                headers: { 'Authorization': "Bearer "+store.state.account.session },
                data,
                url: path,
                method: 'POST'
            }).then((response) => resolve(this.transformAxiosResponse(response, handleError)))
            .catch((error) => resolve(this.transformAxiosError(error, handleError)))
        })
    }

    /**
     * Send a put request to the api
     * @param path Endpoint path
     * @param query Query parameters
     * @returns {Api.Result} Api Result
     */
    async put(path, data = {}, handleError = false, isAlliance = false) {
        let baseURL = isAlliance ? this.getAllianceUrl : this.getApiUrl()

        return new Promise((resolve) => {
            axios.request({
                baseURL,
                headers: { 'Authorization': "Bearer "+store.state.account.session },
                data,
                url: path,
                method: 'PUT'
            }).then((response) => resolve(this.transformAxiosResponse(response, handleError)))
            .catch((error) => resolve(this.transformAxiosError(error, handleError)))
        })
    }

    /**
     * Send a delete request to the api
     * @param path Endpoint path
     * @param query Query parameters
     * @returns {Api.Result} Api Result
     */
    async delete(path, data = {}, handleError = false, isAlliance = false) {
        let baseURL = isAlliance ? this.getAllianceUrl : this.getApiUrl()

        return new Promise((resolve) => {
            axios.request({
                baseURL,
                headers: { 'Authorization': "Bearer "+store.state.account.session },
                data,
                url: path,
                method: 'DELETE'
            }).then((response) => resolve(this.transformAxiosResponse(response, handleError)))
            .catch((error) => resolve(this.transformAxiosError(error, handleError)))
        })
    }

    /**
     * Send a post request to the api to upload a file
     * @param path Endpoint path
     * @param file File to upload
     * @param onProgress Callback for progress updates
     * @param handleError Defaults to false
     * @returns {Api.Result} Api Result
     */
    async upload(path, file, onProgress = undefined, handleError = false, isAlliance = false) {
        let baseURL = isAlliance ? this.getAllianceUrl : this.getApiUrl()
        const data = new FormData()
        data.append("file", file)

        return new Promise((resolve) => {
            axios.request({
                baseURL,
                headers: { 
                    'Authorization': "Bearer "+store.state.account.session,
                    'Content-Type': 'multipart/form-data'
                },
                data,
                url: path,
                method: 'POST',
                onUploadProgress: onProgress
            }).then((response) => resolve(this.transformAxiosResponse(response, handleError)))
            .catch((error) => resolve(this.transformAxiosError(error, handleError)))
        })
    }

    /**
     * Transform an axios error to proper api result object
     * @param error axios error
     */
    transformAxiosError(error, handleError = false) {
        let trustedError = undefined

        if(error.response) {
            const responseBody = error.response.data
            trustedError = new TrustedError(responseBody.statusCode, responseBody.errorId, responseBody.message, responseBody.processId, responseBody.timestamp)
        } else {
            trustedError = new TrustedError(500, "SERVICE_UNAVAILABLE", "", "", Date.now())
        }

        if(handleError) {
            if(trustedError.errorId == "SESSION_EXPIRED" 
                || trustedError.errorId == "UNKNOWN_AUTH_METHOD" 
                || trustedError.errorId == "AUTH_REQUIRED"
                || trustedError.errorId == "UNKNOWN_AUTH_METHOD") {

                if(router.currentRoute.name != 'home') router.push({ name: 'home' })
                Account.logout(true)
                Modal.showMessage('Sitzung abgelaufen', 'Deine Sitzung ist abgelaufen. Du musst dich erneut anmelden, um fortzufahren.', () => {
                    window.location.href = store.state.authFormUrl
                })
            }
            if(trustedError.errorId == "INVALID_ACCOUNT" ) {
                if(router.currentRoute.name != 'home') router.push({ name: 'home' })
                Account.logout(true)
                Modal.showMessage('Konto gesperrt', 'Deine Sitzung wurde geschlossen, da dein Konto aus verschiedenen Gründen gesperrt oder gelöscht wurde.', () => {
                    window.location.href = store.state.authFormUrl
                })
            }

            if(process.env.NODE_ENV != "development" && trustedError.errorId == "SERVICE_UNAVAILABLE") {
                Modal.showMessage("Etwas ist schiefgelaufen", "Der Anmeldeserver ist derzeit nicht erreichbar. Bitte versuche' es später erneut.", () => window.location.reload())
            }
        }

        return trustedError
    }

    /**
     * Transform an axios response to proper api result object
     * @param response Axios response object
     */
    transformAxiosResponse(response, handleError = false) {
        const responseBody = response.data
        handleError

        if(responseBody.data) {
            return new ResultSingleton(responseBody.statusCode, responseBody.data)
        } else if(responseBody.entries) {
            return new ResultSet(responseBody.statusCode, responseBody.entries, responseBody.available)
        } else if(responseBody.errorId) {
            return new TrustedError(responseBody.statusCode, responseBody.errorId, responseBody.message, responseBody.processId, responseBody.timestamp)
        } else {
            return new ResultEmpty(response.status)
        }
    }

    /**
     * Method for building api url from config parameters
     */
    getApiUrl() {
        return store.state.apiBaseUrl
    }
    /**
     * Method for building api url from config parameters
     */
    getAllianceUrl() {
        return store.state.allianceBaseUrl
    }

    /**
     * Function to transform javascript object to query string
     * @param {Object} obj Javascript Object
     * 
     * @returns Resolved promise containing error
     */
    objectToUrlQuery(obj) {
        const str = [];
        for (const p in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }
        return str.join("&");
    }

    static getInstance() {
        if(!this.instance) this.instance = new Api()
        return this.instance
    }
}

    
export class Result {
    statusCode = 200
}

export class ResultSingleton extends Result {
    data

    constructor(statusCode, data) {
        super()
        this.statusCode = statusCode
        this.data = data
    }
}
export class ResultSet extends Result {
    entries
    available

    constructor(statusCode, entries, available) {
        super()
        this.statusCode = statusCode
        this.entries = entries
        this.available = available
    }
}
export class ResultEmpty extends Result {
    constructor(statusCode) {
        super()
        this.statusCode = statusCode
    }
}
export class TrustedError extends Result {
    statusCode
    errorId
    message
    processId
    timestamp

    constructor(statusCode, errorId, message, processId, timestamp) {
        super()
        this.statusCode = statusCode
        this.errorId = errorId
        this.message = message

        this.processId = processId
        this.timestamp = timestamp
    }

    static dummyError() {
        return new TrustedError(500, "SERVICE_UNAVAILABLE", "", "", Date.now())
    }
}
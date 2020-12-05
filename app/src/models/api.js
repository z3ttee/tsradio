import store from '@/store/index.js'
import axios from 'axios'
import config from '@/config/config.js'
import TrustedError from '@/models/error.js'

class Api {

    constructor() {
        axios.defaults.baseURL = config.api.baseURL
        axios.defaults.headers.common['Content-Type'] = "application/json";

        axios.interceptors.request.use((config) => {
            // Set authorization token for every request in header
            config.headers.Authorization = store.state.jwt
            return config
        })
    }

    async get(url, config = {}, suppressToast = false) {
        return new Promise((resolve) => {
            axios.get(url, config).then((response) => {
                resolve(response)
            }).catch((error) => {
                this.handleResponse(error, suppressToast, resolve)
            })
        })
    }
    async post(url, data = {}, suppressToast = false) {
        return new Promise((resolve) => {
            axios.post(url, data).then((response) => {
                resolve(response)
            }).catch((error) => {
                this.handleResponse(error, suppressToast, resolve)
            })
        })
    }

    async handleResponse(error, suppressToast = false, resolve = () => {}) {
        console.log("suppressToast ", suppressToast)

        let err = {}

        if(error.response) {
            // Request left, but received error from api
            let response = error.response
            console.log(response)
            
            err = new TrustedError(response.status, response.data.err, response.data.message)
        } else if(error.request) {
            // Request never left
            err = new TrustedError(503, "SERVICE_UNAVAILABLE", "An unexpected error occured: This often means, the request never made its way to the server")
        } else {
            console.log(error)
            err = new TrustedError(400, "CLIENT_INTERNAL_ERROR", "Unrecognized error occured.")
        }

        console.log(err)
        resolve(err)
    }

}

export default new Api()
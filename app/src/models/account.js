import store from "@/store/index"
import { Api, TrustedError } from "./api"
import router from "../router"

export class Account {
    static instance = undefined

    static getInstance() {
        if(!this.instance) this.instance = new Account()
        return this.instance
    }

    /**
     * Function for saving session token locally
     * @param {String} value Session token, if falsy user gets invalidated
     * @param {Boolean} setCookie Save session in cookie or not
     */
    static setAccessToken(token){
        store.state.account.session = token
    }

    /**
     * Function for saving account data in localStorage
     * @param {String} value Session token, if falsy user gets invalidated
     * @param {Boolean} setCookie Save session in cookie or not
     */
    static async save(data){
        store.commit("updateAccount", data)
    }

    /**
     * Function for loggin-out a user
     */
    static async logout(redirect = false) {
        this.save(undefined).finally(() => {
            if(router.currentRoute.name != 'home' && redirect) {
                router.push({name: 'home'})
            }
        })
    }

    /**
     * Verify session by trying to load account data and check for errors
     */
    static async checkSession(handleError = true, save = false) {
        return await this.loadAccount("@me", handleError, save)
    }

    /**
     * Erases all loaded user data
     */
    static async resetData() {
        store.state.account = {}
        store.state.account.session = undefined
    }

    /**
     * Loads current logged in user's data by sending GET request
     */
    static async loadAccount(memberId, handleError = true, save = false) {
        let result = await Api.getInstance().get("/members/"+memberId, {}, handleError, true)
        if(result instanceof TrustedError) {
            return result
        }

        if(save) {
            this.save(result.data)
        }

        return result.data
    }

    /**
     * Loads current logged in user's data by sending GET request
     */
    static async reloadAccount() {
        return this.loadAccount("@me")
    }

    /**
     * Check if account has a permissions
     * @param {*} permission Permission to check for
     * @returns True or False
     */
    static hasPermission(permission) {
        if(store.state.account?.role?.uuid == "*") return true
        if(store.state.account?.role?.permissions?.contains("*")) return true

        return store.state.account?.role?.permissions?.contains(permission)
    }
    
}
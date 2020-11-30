import { VueCookieNext } from 'vue-cookie-next'
import store from '@/store/index.js'
import api from '@/models/api.js'
import router from '@/router/index.js'

const sessionCookieName = "tsr_session"

class User {
    constructor(){
        let token = VueCookieNext.getCookie(sessionCookieName)
        store.state.user.isLoggedIn = token != undefined
        store.state.user.token = token
    }

    isLoggedIn() {
        return store.state.user.token != undefined && store.state.user.isLoggedIn
    }

    async loginWithCredentials(username, password){
        await api.post('/auth/signin', { username, password }).then((response) => {
            if(response.status == 200) {
                this.setToken(response.data.token)
            }
        });
    }

    async loginWithToken(){
        let token = VueCookieNext.getCookie(sessionCookieName)
        if(token) {
            // TODO: Check if token is valid
        } else {
            this.logout()
        }
    }

    async logout() {
        this.setToken(null).finally(() => {
            if(router.currentRoute.name != 'login') router.push({name: 'login'})
        })
    }

    async setToken(value) {
        if(value) {
            store.state.user.token = value
            store.state.user.isLoggedIn = true
            VueCookieNext.setCookie(sessionCookieName, value, {
                expire: "7d",
                sameSite: "Lax"
            })
        } else {
            store.state.user.token = undefined
            store.state.user.isLoggedIn = false
            VueCookieNext.removeCookie(sessionCookieName)
        }
    }
}

export default new User()
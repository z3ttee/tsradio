import apijs from '@/models/api.js'
import socketjs from '@/models/socket.js'
import store from '@/store/index.js'
import config from '@/config/config.js'
import router from '@/router/index.js'
import { VueCookieNext } from 'vue-cookie-next'

class User {
    async loginWithCredentials(username, password, setCookie = false) {
        let result = await apijs.post('/auth/signin', {username, password})

        if(result.status == 200) {
            if(setCookie) {
                await this.setToken(result.data.token)
            }
        }

        result = await this.setupUser()
        return result
    }
    async loginWithJWT() {
        let jwt = VueCookieNext.getCookie(config.session.cookieName)
        await this.setToken(jwt)
        
        let result = await apijs.get('/auth/verify')

        if(result.status != 200 && !jwt) {
            this.logout()
        }

        return result
    }

    async setupUser() {
        let result = await apijs.get('/users/@me')

        if(result.status != 200) {
            this.logout()
            return result
        }

        store.state.user = result.data
        socketjs.setup()
        return result
    }

    async logout() {
        this.setToken(undefined).finally(() => {
            store.state.channels = {}
            store.state.currentChannel = undefined
            socketjs.disconnect()
            
            if(router.currentRoute.name != 'login') {
                router.push({name: 'login'})
            }
        })
    }

    isLoggedIn(){
        return store.state.jwt != undefined
    }

    async setToken(value){
        if(value) {
            store.state.jwt = value
            store.state.loggedIn = true
            VueCookieNext.setCookie(config.session.cookieName, value, {
                expire: "7d",
                sameSite: "Lax"
            })
        } else {
            store.state.jwt = undefined
            store.state.loggedIn = false
            VueCookieNext.removeCookie(config.session.cookieName)
        }
    }
}

export default new User()
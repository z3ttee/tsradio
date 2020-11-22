import { VueCookieNext } from 'vue-cookie-next'
import store from '@/store/index.js'

class User {
    constructor(){
        let token = VueCookieNext.getCookie("tsr_session")
        store.state.user.isLoggedIn = token != undefined
        store.state.user.token = token
    }

    isLoggedIn() {
        return store.state.user.token != undefined && store.state.user.isLoggedIn
    }

    async loginWithCredentials(){
        
    }
}

export default new User()
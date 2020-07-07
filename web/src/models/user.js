import VueCookies from 'vue-cookies';
import axios from 'axios';
import router from '@/router/router.js'
import store from '@/store/index.js';

const sessionCookieName = "tsr_session";

class User {

    constructor() {
        axios.defaults.baseURL = 'https://api.tsradio.live/v1/';
        axios.defaults.withCredentials = false;

        this.checkLogin();
        if(this.isLoggedIn()) {
            this.loadInfo();
        }
    }

    loginWithCredentials(username, password, callback) {
        axios.get('member/login/?username='+username+"&password="+password).then(response => {
            if(response.status == 200 && response.data.meta.status == 200) {
                var user = response.data.payload.user;

                if(user.session.token) {
                    store.state.user = user
                    var expiry = new Date(user.session.expiry).toString();
                    VueCookies.set('tsr_session', user.session.token, expiry, '/', null, null, true);
                    this.loggedIn = true;
                    callback({ok: true, status: response.data.meta.status, message: response.data.meta.message});
                }
            } else {
                this.loggedIn = false
                callback({ok: false, status: response.data.meta.status, message: response.data.meta.message});
            }
        }).catch(error => {
            console.log(error);
            this.loggedIn = false
            callback({ok: false, message: error});
        });
    }

    loadInfo(){
        var token = VueCookies.get(sessionCookieName) ?? undefined;
        if(token) {
            axios.get('member/info/?session='+token).then(response => {
                if(response.status == 200 && response.data.meta.status == 200) {
                    var user = response.data.payload;
                    user.session = {token: token};
                    store.state.user = user
                } else {
                    this.logout();
                }
            });
        }
    }

    logout() {
        VueCookies.remove(sessionCookieName);
        this.loggedIn = false
        router.push({name: 'login'});
    }

    checkLogin(){
        var token = VueCookies.get(sessionCookieName) ?? undefined;
        if(token && this.checkSession()) {
            this.loggedIn = true;
        } else {
            this.logout();
        }
    }

    checkPermission() {

    }
    checkSession() {
        return true;
    }

    isLoggedIn() {
        this.checkLogin();
        return this.loggedIn;
    }
}

export default new User();
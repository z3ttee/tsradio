import Vue from 'vue'
import VueRouter from 'vue-router'
import User from '@/models/user.js';

import { routes } from './routes.js';
//import store from '../store';
//import VueCookies from 'vue-cookies';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
    scrollBehavior(to, from, savedPosition) {
        if(savedPosition) {
            return savedPosition;
        }
        if(to.hash) {
            return { selector: to.hash };
        }
        return {x: 0, y: 0};
    }
});

router.beforeEach((to, from, next) => {
    if(to.name != 'login') {
        if(User.isLoggedIn()){
            next()
        } else {
            next({name: 'login'});
        }
    } else {
        next();
    }
    // TODO: Check if session hash is expired (cookie expiry can technically be updated by user)

    /*if(!VueCookies.isKey('tsr_session')) {
        store.state.user.session = {}
    }

    if(to.name == 'login' && store.state.user.session.token) {
        next(from);
    }

    // Check if logged in
    if(to.name  != 'login') {
        if(store.state.user.session.token) {
            next()
        } else {
            next({name: 'login'});
        }
    } else {
        next()
    }*/
})

router.afterEach((to) => {
    document.title = to.meta.title
});

export default router;

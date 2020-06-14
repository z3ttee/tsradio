import Vue from 'vue'
import VueRouter from 'vue-router'

import { routes } from './routes.js';

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
    document.title = to.meta.title
    next();
});

export default router;

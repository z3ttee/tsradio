import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from '@/router/routes.js'
import appjs from '@/models/app.js'
import userjs from '@/models/user.js'

var router = createRouter({
    history: process.env.IS_ELECTRON ? createWebHashHistory(process.env.BASE_URL) : createWebHistory(process.env.BASE_URL),
    routes
})


// Before accessing routes, check if user is logged in, otherwise try to login with previously request jwt.
// If no jwt exists, redirect to login page
router.beforeEach((to, from, next) => {
    let setup = async () => {
        if(!userjs.isLoggedIn()) {
            if (to.meta.needsAuth) {
                appjs.setupApp(next)
            } else {
                appjs.skipSetup(next)
            }
        } else {
            next()
        }
    }

    setup()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/router/routes.js'
import appjs from '@/models/app.js'
//import userjs from '@/models/user.js'
//import store from '@/store/index.js'

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// Before accessing routes, check if user is logged in, otherwise try to login with previously request jwt.
// If no jwt exists, redirect to login page
router.beforeEach((to, from, next) => {
    let setup = async () => {
        if (to.meta.needsAuth) {
            appjs.setupApp(next)
        } else {
            appjs.skipSetup(next)
        }
    }

    setup()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/router/routes.js'
import user from '@/models/user.js'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if(to.name != 'login' && !user.isLoggedIn()) {
    router.push({name: 'login'})
  } else {
    next()
  }
})

export default router

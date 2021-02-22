import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import store from '@/store'
import { Account } from '@/models/account'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {  
  if(store.state.account.isLoggedIn) {
    store.state.app.appIsReady = true
    next()

    Account.checkSession().then((isVerified) => {
      if(!isVerified) {
        window.location.href = store.state.authFormUrl
      }
    })
    store.state.app.appIsReady = true
  } else {
    window.location.href = store.state.authFormUrl
  }
})

export default router

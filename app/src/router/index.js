import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import store from '@/store'
import { Account } from '@/models/account'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {  
  if(to.params.requestedPage == "auth/") {
    
    // Try login user
    Account.resetData()
    Account.setAccessToken(to.query.token)
    checkSession(next)

  } else {
    if(store.state.account.session) {
      store.state.app.appIsReady = true
      next()
  
      checkSession()
      
      store.state.app.appIsReady = true
    } else {
      if(process.env.NODE_ENV != "development") window.location.href = store.state.authFormUrl
    }
  }
  
})

function checkSession(next) {
  Account.checkSession(true, true).then((isVerified) => {
    if(!isVerified) {
      if(process.env.NODE_ENV != "development") window.location.href = store.state.authFormUrl
    } else {
      store.state.app.appIsReady = true

      if(next) {
        next()
      }
    }

    
  })
}

export default router

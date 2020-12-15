import userjs from '@/models/user.js'
import store from '@/store/index.js'

class App {
    static async setupApp(next = () => {}) {
        if (!userjs.isLoggedIn()) {
            let jwtValid = await userjs.loginWithJWT()

            if (jwtValid.status == 200) {
                await userjs.setupUser()
                
                store.state.appIsReady = true
                next({ name: 'home' })
            } else if (jwtValid.status == 503) {
                next({ name: 'error503' })
            } else {
                next({ name: 'login' })
            }

            store.state.appIsReady = true
        }
    }

    static async skipSetup(next = () => {}) {
        store.state.appIsReady = true
        next()
    }
}

export default App
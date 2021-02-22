import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import formatDate from 'dateformat'

// Import vue.js plugins
import VueLottiePlayer from 'vue-lottie-player'

// Import models
import { Account } from '@/models/account'
import { Modal } from '@/models/modal'

// Import utils 
import { generateId } from '@/utils/generatorUtil'

// Import global Components
import AppLoaderComp from '@/components/loader/AppLoaderComp.vue'
import AppButtonComp from '@/components/button/AppButtonComp.vue'
import AppAvatarStatic from '@/components/image/AppAvatarStatic.vue'
import AppModal from '@/modals/AppModal.vue'

// Initialize storage
store.commit('initialiseStore')

const app = createApp(App)

app.config.globalProperties.$env = process.env
app.config.globalProperties.$account = Account
app.config.globalProperties.$modal = Modal
app.config.globalProperties.$isProduction = process.env.NODE_ENV === 'production'

app.use(store)
app.use(router)

// Register Vue.js plugins
app.use(VueLottiePlayer)

// Register global components
app.component('app-button', AppButtonComp)
app.component('app-loader', AppLoaderComp)
app.component('app-avatar', AppAvatarStatic)
app.component('app-modal', AppModal)

// Register global methods
app.mixin({
    methods: {
        generateId,
        dateformat(date, format){
            return formatDate(date, format)
        }
    },
})

// Mount app
app.mount('#app')
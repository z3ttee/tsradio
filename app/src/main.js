import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueLottiePlayer from 'vue-lottie-player'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(VueLottiePlayer)

app.mount('#wrapper')

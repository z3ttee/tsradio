import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueLottiePlayer from 'vue-lottie-player'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(VueLottiePlayer)

app.mixin({
    methods: {
        makeid(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },
    }
})

app.mount('#wrapper')

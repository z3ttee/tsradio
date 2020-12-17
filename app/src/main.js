import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueLottiePlayer from 'vue-lottie-player'
import { VuelidatePlugin } from '@vuelidate/core'

// Import required Components
import AppButtonComp from '@/components/button/AppButtonComp.vue'
import AppTextBoxComp from '@/components/message/AppTextBoxComp.vue'
import AppPopupListComp from '@/components/lists/AppPopupListComp.vue'
import AppMessageBoxComp from '@/components/message/AppMessageBoxComp.vue'

// Import api models
import channeljs from '@/models/channel.js'
import socketjs from '@/models/socket.js'
import userjs from '@/models/user.js'
import errorjs from '@/models/error.js'

const app = createApp(App)

app.config.globalProperties.$user = userjs
app.config.globalProperties.$error = errorjs
app.config.globalProperties.$channel = channeljs
app.config.globalProperties.$socket = socketjs

app.use(store)
app.use(router)
app.use(VuelidatePlugin)
app.use(VueLottiePlayer)

app.component("app-button", AppButtonComp)
app.component("app-textbox", AppTextBoxComp)
app.component("app-messagebox", AppMessageBoxComp)
app.component("app-popuplist", AppPopupListComp)

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
        }
    }
})

app.mount('#wrapper')

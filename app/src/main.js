import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { io } from 'socket.io-client'
import { VuelidatePlugin } from '@vuelidate/core'
import VueLottiePlayer from 'vue-lottie-player'

import modaljs from '@/models/modal.js'
import toastjs from '@/models/toast.js'
import apijs from '@/models/api.js'
import userjs from '@/models/user.js'
import channeljs from '@/models/channel.js'

import AppButton from '@/components/button/AppButtonComp.vue'

const CHANNEL_STATUS_UPDATE = "channel_update_status"
const CHANNEL_UPDATE_METADATA = "channel_update_metadata"

store.commit('initialiseStore')
const app = createApp(App)

app.use(store)
app.use(router)
app.use(VuelidatePlugin)
app.use(VueLottiePlayer)

app.component("app-button", AppButton)

app.config.globalProperties.$modal = modaljs
app.config.globalProperties.$toast = toastjs
app.config.globalProperties.$api = apijs
app.config.globalProperties.$user = userjs

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

router.isReady().then(() => app.mount('#wrapper'))

const socket = io("http://"+store.state.config.socket.host+":3000", {
    query: {
        token: store.state.user.token
    }
})

socket.on("connect", () => {
    console.log("connected to socket")
})
socket.on("error", (error) => {
    console.log(error)
})
socket.on(CHANNEL_STATUS_UPDATE, async(message) => {
    let data = JSON.parse(message)
    channeljs.updateChannel(data)
})
socket.on(CHANNEL_UPDATE_METADATA, async(message) => {
    let data = JSON.parse(message)
    channeljs.updateChannel(data)
})
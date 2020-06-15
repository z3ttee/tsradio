import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import store from './store'

import LottiePlayer from 'lottie-player-vue';
Vue.use(LottiePlayer);

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});

import Vue from 'vue'
import VueResource from 'vue-resource';
import VueCookies from 'vue-cookies';

import App from './App.vue'
import router from './router/router.js'
import store from './store'
import LottiePlayer from 'lottie-player-vue';

Vue.use(LottiePlayer);
Vue.use(VueResource);
Vue.use(VueCookies);

Vue.http.options.root = 'https://api.tsradio.live/v1/';
Vue.http.interceptors.push((request, next) => {
    next();
});

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
    created() {
        if(!this.$cookies.isKey('tsr_app_theme')) this.$store.state.theme = 'dark';
    }
});

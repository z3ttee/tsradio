import Vue from 'vue'
import VueResource from 'vue-resource';
import VueCookies from 'vue-cookies';

import App from './App.vue'
import router from './router/router.js'
import store from './store'
import LottiePlayer from 'lottie-player-vue';

import { socketMixin } from '@/mixins/socketMixin.js';

Vue.use(LottiePlayer);
Vue.use(VueResource);
Vue.use(VueCookies);

Vue.http.options.root = 'https://api.tsradio.live/v1/';
Vue.http.interceptors.push((request, next) => {
    next();
});

new Vue({
    el: '#app',
    data: {
        channels: []
    },
    mixins: [socketMixin],
    router,
    store,
    render: h => h(App),
    methods: {
        getChannelByID(id) {
            return this.channels.filter( (element) => element.id == id )[0]
        }
    },
    created() {
        if(!this.$cookies.isKey('tsr_app_theme')) this.$store.state.theme = 'dark';
    },
    mounted() {
        window.onresize = () => {
            const innerWidth = window.innerWidth;

            this.$store.state.display.width = innerWidth;
            this.$store.state.display.mobile = (innerWidth <= 480);
        }
    }
});

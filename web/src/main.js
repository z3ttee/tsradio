import Vue from 'vue'
import axios from 'axios';
import VueCookies from 'vue-cookies';

import App from './App.vue'
import router from './router/router.js'
import store from './store'
import LottiePlayer from 'lottie-player-vue';
import UUID from 'vue-uuid';

import { socketMixin } from '@/mixins/socketMixin.js';

Vue.use(LottiePlayer);
Vue.use(VueCookies);
Vue.use(UUID);

axios.defaults.baseURL = 'http://localhost/v1/';
axios.defaults.withCredentials = false;

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
        // Check if logged in
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

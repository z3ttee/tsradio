import Vue from 'vue'
import axios from 'axios';
import VueCookies from 'vue-cookies';

import App from './App.vue'
import router from './router/router.js'
import store from './store'
import LottiePlayer from 'lottie-player-vue';
import UUID from 'vue-uuid';

//import { socketMixin } from '@/mixins/socketMixin.js';

Vue.use(LottiePlayer);
Vue.use(VueCookies);
Vue.use(UUID);

axios.defaults.baseURL = 'http://localhost/v1/';
axios.defaults.withCredentials = false;

/*store.state.user.session.token = VueCookies.get('tsr_session') ?? undefined;
if(store.state.user.session.token) {
    axios.get('member/info/?session='+store.state.user.session.token).then(response => {
        if(response.status == 200 && response.data.meta.status == 200) {
            console.log(response.data);
            var user = response.data.payload;
            user.session = {token: store.state.user.session.token};
            store.state.user = user
        } else {
            if(response.data.meta.status == 404) {
                store.state.user = {session: {}};
                VueCookies.remove('tsr_session');
                router.to({name: 'login'});
            }
            // TODO: Show error message
            console.log("Error received: "+response.data.meta.message);
        }
    }).catch(error => {
        // TODO: Show error message
        console.log(error)
    });
}*/

new Vue({
    el: '#app',
    data: {
        channels: []
    },
    //mixins: [socketMixin],
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

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        theme: 'light',
        display: {
            width: 1080,
            mobile: false
        },
        channels: [],
        currentChannel: {}
    },
    mutations: {
    },
    actions: {
    },
    modules: {
    }
});

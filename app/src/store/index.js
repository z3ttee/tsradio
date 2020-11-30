import { createStore } from 'vuex'
import { version } from '../../package.json';
import config from '@/config/config.js'

const isDev = process.env.NODE_ENV === 'development'
const localStorageName = 'data'

if(isDev) {
    config.api.baseURL = "http://localhost:3000/"
} else {
    config.api.url = config.api.baseURL+"/"
}

export default createStore({
  state: {
    modals: [],
    user: {
      isLoggedIn: false,
      token: undefined
    },
    toast: undefined,
    version: version,
    config,
    channels: {},
    currentChannel: undefined
  },

  mutations: {
    initialiseStore(state){
      if(localStorage.getItem(localStorageName)) {
        const store = JSON.parse(localStorage.getItem(localStorageName))

        if(store.version == version) {
          this.replaceState(Object.assign(state, JSON.parse(localStorage.getItem(localStorageName))))
        } else {
          state.version = version
        }
      }
    },
  },
  actions: {
  },
  modules: {
  }
})

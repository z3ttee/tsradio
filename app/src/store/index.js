import { createStore } from 'vuex'

const store = createStore({
  state: {
    user: {},
    jwt: undefined,
    appIsReady: false,
    loggedIn: false,
    channels: {},
    currentChannel: undefined
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
  getters: {
  }
})

export default store
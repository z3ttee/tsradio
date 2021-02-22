import { createStore } from 'vuex'
import config from '@/config/config.json'
import { version } from '../../package.json';

if (config.api.port == 80 || config.api.port == 443) {
    config.api.port = 0
}

const localStorageName = 'data'
const apiBaseUrl = config.api.protocol+"://"+config.api.host + (config.api.port != 80 ? ":" + config.api.port : "")

const allianceBaseUrl = config.authService.protocol+"://"+config.authService.host + (config.authService.port != 80 ? ":" + config.authService.port : "")
const avatarBaseUrl = allianceBaseUrl + "/avatars/"
const authFormUrl = config.authForm.url + "?redirect=" + config.authForm.redirectCode

const dummyAccount = {
    session: undefined,
    isLoggedIn: false,
    name: undefined,
    uuid: undefined,
    role: {
        name: undefined,
        uuid: undefined
    },
    avatar: undefined,
    avatarUrl: undefined
}

const dummyState = {
    config,
    version: version,
    avatarBaseUrl,
    apiBaseUrl,
    allianceBaseUrl,
    authFormUrl,
    account: dummyAccount,
    modals: [],
    app: {
        appIsReady: false,
        appRequiresAuth: false,
        showModal: false
    }
}

const store = createStore({
    state: {
        ...dummyState
    },
    mutations: {
        updateAccount(state, payload) {
            if(payload == undefined) {
                state.account = dummyAccount
            } else {
                var account = {
                    ...state.account,
                    ...payload
                }
                account.avatarUrl = avatarBaseUrl + account.avatar
                state.account = account
            }
        },
        initialiseStore(state) {
            if (localStorage.getItem(localStorageName)) {
                const store = {
                    ...dummyState,
                    ...JSON.parse(localStorage.getItem(localStorageName))
                }

                if (store.version == version) {
                    this.replaceState(Object.assign(state, store))
                } else {
                    state.version = version
                }
            }
        }
    },
    actions: {},
    modules: {}
})

store.subscribe((mutation, state) => {
    const data = {
        version: state.version,
        account: state.account
    }

    localStorage.setItem(localStorageName, JSON.stringify(data));
})

export default store
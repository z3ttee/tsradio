import { createStore } from 'vuex'
import config from '@/config/config.json'
import { version } from '../../package.json';

if (config.api.port == 80 || config.api.port == 443) {
    config.api.port = 0
}
if (config.authService.port == 80 || config.authService.port == 443) {
    config.authService.port = 0
}

const localStorageName = 'data'
const apiBaseUrl = config.api.protocol+"://"+config.api.host + (config.api.port != 0 ? ":" + config.api.port : "") + config.api.path
const apiSocketUrl = config.api.protocol+"://"+config.api.host + (config.api.port != 0 ? ":" + config.api.port : "")

const allianceBaseUrl = config.authService.protocol+"://"+config.authService.host + (config.authService.port != 0 ? ":" + config.authService.port : "")
const authFormUrl = config.authForm.url + "?redirect=" + config.authForm.redirectCode
const avatarBaseUrl = allianceBaseUrl + "/avatars/"
const coverBaseUrl = apiBaseUrl + "/covers"

const streamBaseUrl = (process.env.NODE_ENV == "development") ? "https://radio.tsalliance.eu/streams" : window.origin + "/streams"

const dummyAccount = {
    session: undefined,
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
    apiSocketUrl,
    authFormUrl,
    coverBaseUrl,
    streamBaseUrl,
    account: dummyAccount,
    modals: [],
    channels: {},
    activeChannel: undefined,
    app: {
        appIsReady: false,
        isSocketReady: false,
        appRequiresAuth: false,
        showModal: false,
        isTabletMode: false
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
            checkScreenSize()

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


function checkScreenSize() {
    if(window.innerWidth <= 700) {
        dummyState.app.isTabletMode = true
    }

    window.addEventListener('resize', () => {
        if(window.innerWidth <= 700) {
            store.state.app.isTabletMode = true
        } else {
            store.state.app.isTabletMode = false
        }
    })
}
export default store
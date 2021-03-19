import { createStore } from 'vuex'
import config from '@/config/config.json'
import { version } from '../../package.json';

import { Account } from '@/models/account'
import { UrlBuilder } from '@/utils/urlBuilder'

if (config.api.port == 80 || config.api.port == 443) {
    config.api.port = 0
}
if (config.authService.port == 80 || config.authService.port == 443) {
    config.authService.port = 0
}

const localStorageName = 'data'

const dummyState = {
    config,
    version: version,
    modals: [],
    channels: {},
    activeChannel: undefined,
    account: Account.createDummyAccount(),
    app: {
        appIsReady: false,
        isSocketReady: false,
        appRequiresAuth: false,
        showModal: false,
        isTabletMode: false
    },
    urls: {
        allianceBase: UrlBuilder.buildAllianceBase(),
        apiBase: UrlBuilder.buildApiBase(),
        coverBase: UrlBuilder.buildCoverBase(),
        avatarBase: UrlBuilder.buildAvatarBase(),
        streamBase: UrlBuilder.buildStreamBase(),
        authForm: UrlBuilder.buildAuthFormEndpoint(),
    }
}

const store = createStore({
    state: {
        ...dummyState
    },
    mutations: {
        updateAccount(state, payload) {
            if(payload == undefined) {
                state.account = Account.createDummyAccount()
            } else {
                var account = {
                    ...state.account,
                    ...payload
                }
                account.avatarUrl = UrlBuilder.buildAvatarBase() + account.avatar
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
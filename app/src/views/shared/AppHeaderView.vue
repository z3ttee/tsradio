<template>
    <div class="header">
        <div class="content-container">
            <div class="header-bar-section">
                <button class="btn btn-icon btn-l btn-inline" @click="toggleSidebar" v-if="$store.state.loggedIn"><img src="@/assets/images/icons/menu.svg"></button>
            </div>

            <div class="header-bar-section">
                <img id="desktop-banner" src="@/assets/images/branding/ts_radio_banner.svg" alt="" srcset="">
                <img id="mobile-banner" src="@/assets/images/branding/ts_logo_svg.svg" alt="" srcset="">
            </div>

            <div class="header-bar-section">
                <div v-show="$route.name != 'login'">
                    <button class="btn btn-primary btn-m btn-inline" v-if="!$store.state.loggedIn"><img src="@/assets/images/icons/key.svg"> Anmelden</button>
                    <div class="header-profile">
                        <span id="username">{{ $store.state.user.username }}</span> <div class="profile-avatar align-right"></div>
                        <app-popuplist :width="300">
                            <!--<router-link custom v-slot="{ navigate }" :to="{name: 'viewProfile'}"><li @click="navigate">Profil ansehen</li></router-link>-->
                            <li @click="$user.logout()"><img src="@/assets/images/icons/power.svg"> Abmelden</li>
                        </app-popuplist>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
//import sidebarEventListener from '@/events/SidebarEventListener.js'

export default {
    methods: {
        toggleSidebar() {
            //sidebarEventListener.emit('toggle')
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.header {
    padding: $boxPad 0;

    .header-bar-section {
        vertical-align: middle;
        display: inline-block;
        width: 33%;
        text-align: center;

        img#desktop-banner,
        img#mobile-banner {
            height: 50px;
        }

        img#mobile-banner {
            display: none;
        }

        &:first-of-type {
            text-align: left;
        }
        &:last-of-type {
            text-align: right;
        }
    }

    .header-profile {
        position: relative;
        font-size: 0.7em;
        font-weight: 600;
        letter-spacing: 1px;
        cursor: pointer;
    }
}

@media screen and (max-width: 950px) {
    .header {
        img#desktop-banner {
            display: none;
        }
        img#mobile-banner {
            display: inline-block !important;
            width: 32px;
            height: 32px;
        }
    }
}

@media screen and (max-width: 580px) {
    span#username {
        display: none;
    }
}
</style>
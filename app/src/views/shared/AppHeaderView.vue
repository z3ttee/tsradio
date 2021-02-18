<template>
    <div :class="'header ' + getHeaderStateClass" id="app-header">
        <div class="content-container">
            <div class="header-bar-section">
                <img id="desktop-banner" src="@/assets/images/branding/ts_radio_logo.svg" alt="" srcset="">
                <img id="mobile-banner" src="@/assets/images/branding/ts_logo_svg.svg" alt="" srcset="">
            </div>

            <div class="header-bar-section">
                <div v-if="!!$store.state.jwt">
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
export default {
    data() {
        return {
            headerState: 0
        }
    },
    computed: {
        getHeaderStateClass() {
            if(this.headerState == 1) {
                return "state-scrolling"
            } else if(this.headerState == 2) {
                return "state-hide"
            } else {
                return "state-default"
            }
        }
    },
    methods: {
        changeHeaderState() {
            const scrolledValue = window.scrollY
            const windowPageScrollValue = window.innerHeight/2

            if(scrolledValue >= 20 && scrolledValue < windowPageScrollValue) {
                this.headerState = 1
            } else if(scrolledValue >= windowPageScrollValue) {
                this.headerState = 2
            } else {
                this.headerState = 0
            }
        }
    },
    mounted() {
        document.addEventListener("scroll", this.changeHeaderState)
    },
    unmounted() {
        document.removeEventListener("scroll", this.changeHeaderState)
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.header {
    position: fixed;
    top: 0;
    z-index: 100;
    width: 100%;
    padding: $boxPad*1.5 0;
    border-bottom: 2px solid transparent;
    transition: all $animSpeedFast*1s $cubicNorm;

    &.state-scrolling {
        background-color: $colorPrimary;
        box-shadow: $shadowNormal;
        padding: $boxPad/1.5 0;
        border-bottom: 2px solid $colorPlaceholder;

        #desktop-banner,
        #mobile-banner {
            height: 40px !important;
        }
    }

    &.state-hide {
        transform: translateY(-100%);
    }

    .header-bar-section {
        vertical-align: middle;
        display: inline-block;
        width: 50%;
        text-align: center;

        img#desktop-banner,
        img#mobile-banner {
            height: 40px;
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
        display: inline-block;
        position: relative;
        font-size: 0.7em;
        font-weight: 600;
        letter-spacing: 1px;
        cursor: pointer;
    }
}

@media screen and (max-width: 580px) {
    .header {

        &.state-scrolling {
            padding: $boxPad/1.5 0;
        }
    }
}

@media screen and (max-width: 380px) {
    span#username {
        display: none;
    }
}
</style>
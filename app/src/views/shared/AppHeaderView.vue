<template>
    <div :class="'header-wrapper ' + getHeaderStateClass">
        <div class="content-container">
            <div class="header-section branding-section">
                <router-link :to="{ name: 'home' }" custom v-slot="{navigate}">
                    <div id="desktop-logo" @click="navigate">
                        <img src="@/assets/images/branding/ts_radio_logo.svg" alt="Alliance Logo" >
                    </div>
                </router-link>
            </div>

            <div class="header-section profile-section" v-if="$store.state.account.session">
                <app-avatar class="avatar-m avatar-round" @click="openAccount" style="cursor: pointer;">{{ $store.state.account.name }}</app-avatar>
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
            const windowPageScrollValue = window.innerHeight+100

            if(scrolledValue >= 10 && scrolledValue < windowPageScrollValue) {
                this.headerState = 1
            } else if(scrolledValue >= windowPageScrollValue) {
                this.headerState = 2
            } else {
                this.headerState = 0
            }
        },
        openAccount() {
            window.open('https://tsalliance.eu/account', '_blank')
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

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

#desktop-logo {
    cursor: pointer;
}

.header-wrapper {
    display: inline-block;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 10000;
    transition: all $animSpeedNormal*1s $cubicNorm;
    border-bottom: 2px solid transparent;

    &.state-scrolling,
    &.state-hide {
        background-color: $colorPrimary;
        box-shadow: $shadowNormal;
        border-bottom: 2px solid $colorPlaceholder;

        &.state-hide {
            transform: translateY(-100%);
        }
    }

    .content-container {
        padding: $windowPad/2 $windowPad;
        transition: all $animSpeedNormal*1s $cubicNorm;
    }

    .header-section {
        display: inline-block;
        vertical-align: middle;
        
        &:last-of-type:not(:first-of-type) {
            float: right;
        }
    }

    img {
        display: inline-block;
        height: 40px;
        vertical-align: middle;
    }
}

@media screen and (max-width: 540px) {
    .header-wrapper {
        #desktop-logo {
            height: 32px;
        }

        .content-container {
            transition: all $animSpeedNormal*1s $cubicNorm;
        }
    }
}
</style>
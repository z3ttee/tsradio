<template>

    <transition name="anim_splashscreen" mode="out-in" appear>
        <app-splash-screen key="key-comp-splashscreen" v-if="!$store.state.app.appIsReady || !$store.state.app.isSocketReady"></app-splash-screen>
    </transition>
    
    <transition name="anim_state_change" mode="out-in" appear>
        <component :is="getLayout" key="key-comp-layout" v-if="$store.state.app.appIsReady && $store.state.app.isSocketReady"></component>
    </transition>

    <div :class="{'modal-overlay': true, 'hidden': !$store.state.app.showModal}" @click="dismissModal"></div>
    <div :class="{'hidden': !$store.state.app.showModal}" id="modal-wrapper" @click="dismissModal">
        <transition-group name="anim_dialog" mode="out-in">
            <div class="modal-container" v-for="modal in $store.state.modals" :key="modal.uuid">
                <component  :is="modal.component" :content="modal.content"></component>
            </div>
        </transition-group>
    </div>
</template>

<script>
import AppSplashScreen from '@/views/shared/AppSplashScreenView.vue'
import AppSpaLayout from "@/layouts/AppSPALayout.vue"

export default {
    components: {
        AppSpaLayout,
        AppSplashScreen
    },
    methods: {
        dismissModal(event) {
            this.$modal.dismiss(event)
        }
    },
    computed: {
        getLayout() {
            return this.$route.meta?.layout || AppSpaLayout;
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/scss/style.scss";
</style>

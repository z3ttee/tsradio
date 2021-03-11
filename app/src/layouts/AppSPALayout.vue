<template>
    <div class="layout-spa">
        <app-header-view></app-header-view>
        <router-view custom v-slot="{Component}">
            <div class="content-container" id="spa-layout">
                <transition name="anim_state_change" mode="out-in">
                    <keep-alive :max="5">
                        <component :is="Component"></component>
                    </keep-alive>
                </transition>
            </div>
        </router-view>
        <app-footer-view></app-footer-view>
        <app-player-view></app-player-view>
    </div>
</template>

<script lang="js">
import AppHeaderView from "@/views/shared/AppHeaderView.vue"
import AppFooterView from "@/views/shared/AppFooterView.vue"
import AppPlayerView from "@/views/shared/AppPlayerView.vue"


export default {
    components: {
        AppHeaderView,
        AppFooterView,
        AppPlayerView
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.layout-spa {
    transition: all $animSpeedFast*1s $cubicNorm;
    padding-bottom: 4.85em;
}
#spa-layout {
    padding-top: 6em;
    min-height: 100vh;
}
</style>
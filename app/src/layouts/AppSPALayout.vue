<template>
    <div class="layout-spa" id="layout">
        <app-header-view></app-header-view>
        <router-view custom v-slot="{Component}">
            <main class="content-wrapper" id="scrollable-area">
                <div class="content-container">
                    <transition name="anim_page_change" mode="out-in">
                        <keep-alive :max="5">
                            <component :is="Component"></component>
                        </keep-alive>
                    </transition>
                </div>
            </main>
        </router-view>
        <app-player-view></app-player-view>
    </div>
</template>

<script lang="js">
import AppHeaderView from "@/views/shared/AppHeaderView.vue"
import AppPlayerView from "@/views/shared/AppPlayerView.vue"

export default {
    components: {
        AppHeaderView,
        AppPlayerView
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.layout-spa {
    transition: all $animSpeedFast*1s $cubicNorm;
    height: 100%;
    overflow: hidden;
}

.content-wrapper {
    display: inline-block;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100vh - #{$headerHeight} - #{$playerHeight});
    padding-bottom: $boxPad;
}
</style>
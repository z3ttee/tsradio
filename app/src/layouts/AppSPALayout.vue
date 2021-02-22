<template>
    <div class="layout-spa">
        <app-header-view></app-header-view>
        <router-view custom v-slot="{Component}">
            <div class="content-container" id="spa-layout">
                <transition name="anim_state_change" mode="out-in">
                    <component :is="Component"></component>
                </transition>
            </div>
        </router-view>
    </div>
</template>

<script lang="js">
import AppHeaderView from "@/views/shared/AppHeaderView.vue"

export default {
    components: {
        AppHeaderView
    }
}
</script>

<style lang="scss" scoped>
#spa-layout {
    padding-top: 7em;
}
</style>
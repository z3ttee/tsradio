<template>
    <app-header-view></app-header-view>
    <div class="content-container">
        <router-view></router-view>
    </div>

    <app-footer-view></app-footer-view>
    <app-sidebar-view></app-sidebar-view>
</template>

<script>
import AppHeaderView from '@/views/shared/AppHeaderView.vue'
import AppFooterView from '@/views/shared/AppFooterView.vue'
import AppSidebarView from '@/views/shared/AppSidebarView.vue'

export default {
    components: {
        AppHeaderView,
        AppFooterView,
        AppSidebarView
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/fonts.scss';
@import '@/assets/scss/style.scss';
</style>
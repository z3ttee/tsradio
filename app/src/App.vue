<template>
    <app-header-view></app-header-view>
    <div class="content-container">
        <router-view></router-view>
    </div>

    <app-footer-view></app-footer-view>
    <app-sidebar-view></app-sidebar-view>

    <div class="modal-container" v-if="modals.length > 0">
        <div class="modal-overlay" v-if="modals.length > 0"></div>
        <app-modal v-for="modal in modals" :modal="modal" :key="modal.id"></app-modal>
    </div>
</template>

<script>
import AppHeaderView from '@/views/shared/AppHeaderView.vue'
import AppFooterView from '@/views/shared/AppFooterView.vue'
import AppSidebarView from '@/views/shared/AppSidebarView.vue'

import AppModal from '@/components/modal/AppModalComp.vue'

export default {
    components: {
        AppHeaderView,
        AppFooterView,
        AppSidebarView,
        AppModal
    },
    computed: {
        modals() {
            return this.$store.state.modals
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/fonts.scss';
@import '@/assets/scss/style.scss';
@import '@/assets/scss/modal.scss';
</style>
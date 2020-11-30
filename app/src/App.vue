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

    <transition name="toast" mode="out-in" :appear="true">
        <div id="toast-container" v-if="toast">
            <app-toast :toast="toast" :key="toast.id"></app-toast>
        </div>
    </transition>

    <app-player-bar-view></app-player-bar-view>
</template>

<script>
import AppHeaderView from '@/views/shared/AppHeaderView.vue'
import AppFooterView from '@/views/shared/AppFooterView.vue'
import AppPlayerBarView from '@/views/shared/AppPlayerBarView.vue'
import AppSidebarView from '@/views/shared/AppSidebarView.vue'

import AppToast from '@/components/message/AppToastComp.vue'
import AppModal from '@/components/modal/AppModalComp.vue'

export default {
    components: {
        AppHeaderView,
        AppFooterView,
        AppSidebarView,
        AppPlayerBarView,
        AppModal,
        AppToast
    },
    computed: {
        modals() {
            return this.$store.state.modals
        },
        toast() {
            var toast = this.$store.state.toast
            return toast
        },
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/animations.scss';
@import '@/assets/scss/fonts.scss';
@import '@/assets/scss/style.scss';
@import '@/assets/scss/modal.scss';
</style>
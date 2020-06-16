<template>
    <transition name="backPage" mode="out-in">
        <tsr-layout v-if="$route.meta.group == 'default'"></tsr-layout>
        <tsr-dash-layout v-else></tsr-dash-layout>
    </transition>
</template>

<script>
import DefaultLayout from './views/layouts/Layout.vue';
import DashboardLayout from './views/layouts/DashboardLayout.vue';

export default {
    components: {
        tsrLayout: DefaultLayout,
        tsrDashLayout: DashboardLayout
    }
}
</script>

<style lang="scss" scoped>
    .backPage-enter-active {
        animation: backInUp 0.5s $cubicNormal forwards;
    }
    .backPage-leave-active {
        animation: backOutDown 0.5s $cubicNormal forwards;
    }

    @keyframes backInUp {
        0% {
            opacity: 0;
            transform: scale(0.98) translateY(2em);
        }
        50% {
            opacity: 1;
            transform: scale(0.98) translateY(0);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    @keyframes backOutDown {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        50% {
            opacity: 1;
            transform: scale(0.98) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0.98) translateY(2em);
        }
    }
</style>

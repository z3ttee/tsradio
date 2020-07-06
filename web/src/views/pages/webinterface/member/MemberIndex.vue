<template>
    <div class="content-container">
        <h5>Benutzerverwaltung</h5>
        <component :is="getComponent"></component>
    </div>
</template>
<script>
import Loader from '@/components/loader/SidebarLoader.vue';

export default {
    computed: {
        currentAction(){
            return this.$route.params.action.charAt(0).toUpperCase() + this.$route.params.action.slice(1);
        },
        getComponent() {
            this.currentAction;
            return () => ({
                component: import('@/views/pages/webinterface/member/Member'+this.currentAction+'.vue'),
                loading: Loader,
                error: "",
                delay: 0
            });
        }
    }
}
</script>
<style lang="scss" scoped>
    h5 {
        font-family: 'BebasKai';
        font-weight: 400;
        color: $colorAccent;
    }
</style>
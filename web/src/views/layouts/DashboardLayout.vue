<template>
    <div>
        <app-sidebar></app-sidebar>
        <router-view></router-view>
        <div style="height: 10em;"></div>
    </div>
</template>

<script>
import Sidebar from '@/views/shared/WebinterfaceSidebar.vue';

export default {
    components: {
        appSidebar: Sidebar
    }
}
</script>
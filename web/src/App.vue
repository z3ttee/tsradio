<template>
    <div>
        <tsr-layout v-if="$route.meta.group == 'default'"></tsr-layout>
        <tsr-dash-layout v-else></tsr-dash-layout>
    </div>
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

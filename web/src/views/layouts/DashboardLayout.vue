<template>
    <div id="wrapper">
        <div class="col">
            <app-sidebar></app-sidebar>
        </div>
        <div class="col">
            <router-view></router-view>
        </div>
        
        <!--<div id="webinterface-content">
            
        </div>-->
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

<style lang="scss" scoped>
    #wrapper {
        background: $colorPrimaryDark;
        overflow: hidden;
        display: table;
        width: 100%;

        .col {
            display: table-cell;
            vertical-align: top;

            &:first-of-type {
                width: 344px;
            }
        }
    }

    .content-container {
        display: block;
        padding: 4em;
        padding-bottom: 0em;
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }

    
</style>
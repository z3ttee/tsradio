<template>
    <section>
        <div class="grid-wrapper">
            <div class="grid-container">
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
            </div>
        </div>

        <div class="grid-wrapper">
            <h4>Weiter Channels</h4>
            <div class="grid-container">
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
            </div>
        </div>

        <div class="grid-wrapper">
            <h4>Weiter Channels</h4>
            <div class="grid-container">
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
                <app-grid-item></app-grid-item>
            </div>
        </div>
        
    </section>
</template>

<script lang="js">
import AppGridItem from '@/components/item/AppGridItem.vue'
export default {
    components: {
        AppGridItem
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.grid-wrapper {
    margin-top: 3em;
    display: inline-block;
    width: 100%;

    &:first-of-type {
        margin: 0;
    }

    h1,h2,h3,h4,h5,h6 {
        padding-left: 16px;
    }

    .grid-container {
        display: grid;
        width: 100%;
        grid-template-columns: 25% 25% 25% 25%;
    }
}

@media screen and (max-width: 900px) {
    .grid-container {
        grid-template-columns: 33.333% 33.333% 33.333% !important;
    }
}

@media screen and (max-width: 700px) {
    .grid-container {
        grid-template-columns: 50% 50% !important;
    }
    
}

@media screen and (max-width: 500px) {
    .grid-container {
        grid-template-columns: 100% !important;
    }
    
}
</style>
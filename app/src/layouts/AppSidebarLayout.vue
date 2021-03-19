<template>
    <div class="layout-table">
        <div class="layout-col">
            <div class="col-container" id="layout-sidebar">
                <app-sidebar></app-sidebar>
            </div>
        </div>
        <div class="layout-col">
            <div class="col-container" id="layout-content">
                <div class="content-container">
                    <router-view custom v-slot="{Component}">
                        <transition name="anim_page_change" mode="out-in">
                            <component :is="Component"></component>
                        </transition>
                    </router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppSidebar from "@/views/shared/AppSidebarView.vue"

export default {
    components: {
        AppSidebar
    },
    methods: {
        calculateContentHeight() {
            let sidebarElement = document.getElementById("layout-sidebar")
            let contentElement = document.getElementById("layout-content")
            let windowHeight = window.innerHeight
            if(sidebarElement) sidebarElement.style.height = windowHeight+"px"
            if(contentElement) contentElement.style.height = windowHeight+"px"
        }
    },
    mounted() {
        this.calculateContentHeight()
        window.addEventListener('resize', this.calculateContentHeight)
    },
    unmounted() {
        window.removeEventListener('resize', this.calculateContentHeight)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.layout-table {
    display: table;
    width: 100%;
    height: 100%;

    .content-container {
        margin-left: 0;
        padding: 0;
        width: 650px !important;
    }

    .layout-col {
        display: table-cell;
        overflow-y: auto;
        vertical-align: top;
        &:first-of-type {
            width: 33%;
            background-color: $colorPrimary;
        }
        &:last-of-type {
            width: 66%;
        }
    }
    .col-container {
        display: block;
        height: 100%;
        overflow: hidden;
        overflow-y: auto;
        padding: $windowPad;
    }
}
</style>

<style lang="scss">
@import "@/assets/scss/_variables.scss";
/*
[]=========== Page layout ===========[]
*/
section {

    .title {
        margin-bottom: 2em;

        button {
            float: right;
        }
    }

    .section-box {
        padding: $boxPad;
        background-color: $colorPrimary;
        border-radius: $borderRadSmall;
        margin-bottom: 2em;

        h6 {
            opacity: 0.5;
            text-transform: uppercase;
        }

        p {

            font-size: 0.9em;
        }

        &.section-dark {
            background-color: $colorPrimary;
        }
        &.no-pad {
            padding: 0;
        }
    }

    hr {
        appearance: none;
        border: none;
        background-color: $colorPlaceholder;
        display: block;
        height: 2px;
        width: 100%;
        border-radius: 8px;
        float: right;
        opacity: 0.3;
        margin: 1em 0;
    }

    .form {
        margin-top: 2em;
        display: block;
        padding: $boxPad;
        background-color: $colorPrimaryDark;
        border-radius: $borderRadSmall;
    }

    .section-group {
        margin: 2em 0;

        &:first-of-type {
            margin-top: 0;
        }
        &:last-of-type {
            margin-bottom: 0;
        }
    }
}
</style>
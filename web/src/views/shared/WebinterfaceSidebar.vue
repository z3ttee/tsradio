<template>
    <div class="tsr_sidebar">
        <div class="tsr_toolbar">
            <div class="toolbar_group" @click="currentCategory = 'DashboardActions'">
                <img src="/assets/images/branding/ts_logo_svg.svg">
            </div>
            <hr>
            <div class="toolbar_group" @click="currentCategory = 'channelsActions'">
                <img src="/assets/images/icons/broadcast.svg">
            </div>
            <div class="toolbar_group" @click="currentCategory = 'nodesActions'">
                <img src="/assets/images/icons/connection.svg">
            </div>
            <div class="toolbar_group" @click="currentCategory = 'playlistsActions'">
                <img src="/assets/images/icons/playlist.svg">
            </div>
            <div class="toolbar_group" @click="currentCategory = 'MembersActions'">
                <img src="/assets/images/icons/team.svg">
            </div>
        </div>
        <div class="tsr_actionbar">
            <component :is="loadComponent"></component>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            currentCategory: 'DashboardActions'
        }
    },
    computed: {
        loadComponent() {
            return () => import('@/components/sidebar/'+this.currentCategory+'.vue')
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_sidebar {
        position: fixed;
        display: table;
        background-color: $colorPrimary;
        height: 100%;
        border-top-right-radius: $borderRadLarge;
        border-bottom-right-radius: $borderRadLarge;
        overflow: hidden;
        box-shadow: $shadowNormal;

        .tsr_toolbar {
            display: table-cell;
            width: 64px;
            background-color: $colorPrimaryDark;
            border-top-right-radius: $borderRadLarge;
            border-bottom-right-radius: $borderRadLarge;
        }
        .tsr_actionbar {
            display: table-cell;
            width: 240px;
            vertical-align: top;
        }
    }

    .toolbar_group {
        position: relative;
        width: 64px;
        height: 50px;
        border-top-left-radius: 1.5em;
        border-bottom-left-radius: 1.5em;
        margin: 0.5em 0em;
        transition: all $animSpeedShort*1s $cubicNormal;

        img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            height: 24px;
            width: 24px;
        }

        &:first-of-type {
            background-color: $colorPrimaryDark !important;

            img {
                height: 32px;
                width: 32px;
            }
        }

        &.active {
            background-color: $colorPrimary;
        }
        &:hover {
            cursor: pointer;
            background-color: $colorPrimary;
        }
    }

    hr {
        appearance: none;
        border: none;
        height: 3px;
        width: 50%;
        margin: 0 auto;
        background-color: $colorPlaceholder;
        opacity: 0.4;
        border-radius: 4px;
    }
</style>
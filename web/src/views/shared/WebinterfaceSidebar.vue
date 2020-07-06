<template>
    <div class="tsr_sidebar">
        <div class="tsr_toolbar">
            <router-link class="toolbar_group" tag="div" :to="{name: 'webinterfaceDashboard'}" active-class="active"><img src="/assets/images/branding/ts_logo_svg.svg"></router-link>
            <hr class="interface">
            <router-link class="toolbar_group" tag="div" :to="{name: 'webinterfaceChannels'}" active-class="active"><img src="/assets/images/icons/broadcast.svg"></router-link>
            <router-link class="toolbar_group" tag="div" :to="{name: 'webinterfacePlaylists'}" active-class="active"><img src="/assets/images/icons/playlist.svg"></router-link>
            <router-link class="toolbar_group" tag="div" :to="{name: 'webinterfaceMembers'}" active-class="active"><img src="/assets/images/icons/team.svg"></router-link>
        </div>
        <div class="tsr_actionbar">
            <div class="actionbar_profile">
                <div class="profile_wrapper">
                    <div class="col">
                        <div class="profile_picture" :style="'background-image: url(/upload/avatars/'+$store.state.user.id+'.png);'"></div>
                    </div>
                    <div class="col profile_info">
                        <p>Angemeldet als <span>{{ $store.state.user.name }}</span></p>
                    </div>
                </div>
                <div class="btn-bar">
                    <button class="btn btn-secondary btn-tiny" @click="goHome">Verlassen</button>
                    <button class="btn btn-secondary btn-tiny" @click="logout">Abmelden</button>
                </div>
            </div>
            <hr class="interface large">
            <div class="sidebar-title">
                <span>Aktionsmenü</span>
                <h5>{{ $route.meta.sidebarTitle }}</h5>
            </div>
            <component :is="loadComponent"></component>
        </div>
    </div>
</template>

<script>
import User from '@/models/user.js';
import Loader from '@/components/loader/SidebarLoader.vue';

export default {
    data() {
        return {
            currentCategory: 'DashboardActions'
        }
    },
    watch: {
        '$route.meta.sidebarComponent'(val) {
            this.currentCategory = val
        }
    },
    computed: {
        loadComponent() {
            this.currentCategory
            return () => ({
                component: import('@/components/sidebar/'+this.currentCategory+'.vue'),
                loading: Loader,
                error: "",
                delay: 0
            });
        }
    },
    methods: {
        logout() {
            User.logout();
        },
        goHome() {
            this.$router.push({name: 'home'});
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_sidebar {
        position: relative;
        display: table;
        background-color: $colorPrimary;
        height: 100%;
        border-top-right-radius: $borderRadLarge;
        border-bottom-right-radius: $borderRadLarge;
        overflow: hidden;
        box-shadow: $shadowNormal;

        .sidebar-title {
            line-height: 1.4em;

            span {
                font-family: 'BebasKai';
                letter-spacing: 1px;
                color: $colorAccent;
                font-size: 0.9em;
            }
        }

        

        .tsr_toolbar {
            display: table-cell;
            width: 64px;
            background-color: $colorPrimaryDark;
            border-top-right-radius: $borderRadLarge;
            border-bottom-right-radius: $borderRadLarge;
            overflow: hidden;
        }
        .tsr_actionbar {
            position: relative;
            display: table-cell;
            width: 280px;
            max-width: 280px;
            overflow: hidden;
            vertical-align: top;
            padding: 1em;
        }
    }

    .action_group {
        margin: 2em 0em;
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

    .actionbar_profile {
        margin-top: 1em;

        .btn {
            margin: 0em 0.2em;
            &:first-of-type {
                margin-left: 0em;
            }
            &:last-of-type {
                margin-right: 0em;
            }
        }

        .btn-bar {
            margin: 0.5em 0em;
        }

        .profile_wrapper {
            display: table;
            width: 100%;

            .col {
                display: table-cell;
                vertical-align: middle;
            }

            .profile_picture {
                width: 40px;
                height: 40px;
                
                border-radius: 50%;
                box-shadow: $shadowNormal;
                background-color: $colorPlaceholder;

                background-position: center;
                background-size: cover;
            }

            .profile_info {
                text-align: left;

                p {
                    margin: 0;
                    padding: 0;
                    font-size: 0.8em;
                    font-weight: 300;
                }

                span {
                    color: $colorAccent;
                    font-weight: 800;
                }
            }
        }
    }
    
</style>
<template>
    <div class="app-sidebar">
        <div class="sidebar-group">
            <img id="page-logo" src="@/assets/images/branding/ts_logo.svg" alt="">
        </div>
        <div class="sidebar-group">
            <ul>
                <li class="label">Kontoeinstellungen</li>
                <router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'account' }">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Mein Konto</li>
                </router-link>
                <!--<router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'safety' }">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Sicherheit</li>
                </router-link>
                <router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'connections' }">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Verknüpfungen</li>
                </router-link>-->
            </ul>
        </div>

        <hr>
        
        <div class="sidebar-group">
            <ul>
                <li class="label">Administration</li>
                <!--<router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'users' }" v-if="!$isProduction">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Benutzer</li>
                </router-link>
                <router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'roles' }" v-if="!$isProduction">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Gruppen</li>
                </router-link>
                <router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'modules' }">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Module</li>
                </router-link>
                <router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'invites' }">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Einladungen</li>
                </router-link>-->
            </ul>
        </div>

        <hr>
        <div class="sidebar-group">
            <ul>
                <li class="label">TS Apps (Verlinkung)</li>
                <app-loader v-if="isLoadingModules"></app-loader>
                <li v-for="module in $store.state.modules" :key="module.uuid" @click="redirectToModule(module)">{{ module.name }}</li>
            </ul>
        </div>

        <hr>
        <div class="sidebar-group">
            <ul>
                <router-link custom v-slot="{ navigate, isExactActive }" :to="{ name: 'home' }">
                    <li @click="navigate" :class="{ 'active': isExactActive }">Zur Startseite</li>
                </router-link>
                <li @click="logout" >Abmelden</li>
                <li @click="deleteAccount" class="item-danger">Konto löschen</li>
            </ul>
        </div>

        <div class="sidebar-group">
            <ul class="footer">
                <li>&copy; {{ new Date().getFullYear() }} {{ $env.VUE_APP_ORG }}</li>
                <li>Release v{{ $env.VUE_APP_VERSION }}</li>
                <li>Developed by {{ $env.VUE_APP_AUTHOR }}</li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isLoadingModules: true,
        }
    },
    methods: {
        redirectToModule(module) {
            let url = module.url
            window.open(url, '_blank')
        },
        deleteAccount() {
            this.$modal.showConfirmModal(this.$store.state.account.name, (next) => {
                console.log("Confirmed")
                this.$account.deleteMe().finally(() => {
                    next()
                })
            });
        },
        logout() {
            this.$modal.showInfoModal("Du bist in Begriff dich abzumelden. Möchtest du wirklich fortfahren?", "Jetzt abmelden?", (next) => {
                this.$account.logout(true)
                next()
            })
        }
    },
    mounted() {
        this.$module.loadAll().finally(() => {
            this.isLoadingModules = false
        })
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
.app-sidebar {
    --sidebar_list_width: 180px;
    &::selection {
        background-color: transparent;
        color: inherit;
    }
    .sidebar-group {
        display: inline-block;
        width: 100%;
        padding: $boxPad 0;
    }
    ul {
        list-style: none;
        padding: 0;
        display: block;
        width: var(--sidebar_list_width);
        float: right;
        li {
            padding: 0.55em;
            font-weight: 400;
            margin: 0.15em 0;
            &.item-danger {
                color: $colorAccent;
                border: 1px solid $colorAccent;
            }
        }
        &:not(.footer) {
            li {
                opacity: 0.7;
                font-size: 1em;
                border-radius: 4px;
                transition: all 0.1s ease;
                &.label {
                    font-size: 0.65em;
                    font-weight: 600;
                    font-family: 'Poppins';
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                }
                &:hover:not(.label),
                &.active:not(.label) {
                    opacity: 1;
                    background-color: rgba($color: $colorPrimaryDark, $alpha: 1.0);
                    cursor: pointer;
                }
                &:active:not(.label):not(.active) {
                    transform: scale(0.96);
                }
            }
        }
        &.footer {
            li {
                color: $colorPlaceholder;
                font-size: 0.85em;
                padding-top: 0;
                padding-bottom: 0;
            }
        }
    }
    hr {
        width: var(--sidebar_list_width);
        float: right;
        margin: 0;
    }
    #page-logo {
        float: right;
        width: var(--sidebar_list_width);
        height: 45px;
    }
}
</style>
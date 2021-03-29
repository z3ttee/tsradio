<template>
    <footer>
        <div class="content-container">
            <div class="layout-table">
                <div class="layout-col">
                    <img class="icon-xl" src="@/assets/images/branding/ts_logo.svg" alt="Logo">
                </div>
                <div class="layout-col">
                    <h6>Navigation</h6>
                    <hr>
                    <ul>
                        <li v-for="link in navigation" :key="link.name">
                            <router-link :to="link.route.name" custom v-slot="{navigate}" v-if="link.route">
                                <a href="" @click="navigate">{{ link.name }}</a>
                            </router-link>
                            <a :href="link.url.value" :target="link.url.target" v-else>{{ link.name }}</a>
                        </li>
                    </ul>
                </div>
                <div class="layout-col">
                    <h6>TOP-Channels</h6>
                    <hr>
                    <ul>
                        <li v-for="channel in getFeaturedChannels" :key="channel.uuid">
                            <router-link :to="{name: 'channel', params: { channelId: channel.uuid }}" custom v-slot="{navigate}">
                                <a href="" @click="navigate">{{ channel.title }}</a>
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="copyright">&copy; {{ new Date().getFullYear() }} TSAlliance | All rights reserved</div>
    </footer>
</template>

<script>
export default {
    data() {
        return {
            navigation: [
                { name: 'Startseite', route: { name: 'home' } },
                { name: 'Dein Konto', url: { value: 'https://tsalliance.eu/account', target: '_blank' } },
                { name: 'Impressum', url: { value: 'https://easternexploration.de/?page_id=107', target: '_blank' }},
            ]
        }
    },
    computed: {
        getFeaturedChannels() {
            var values = Object.values(this.$store.state.channels).filter((channel) => channel && channel.featured && channel.enabled && channel.activeSince)
            return values
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.copyright {
    background-color: $colorPrimary;
    text-align: center;
    padding: $boxPad 0;
    margin-top: $windowPad;
    color: rgba($color: $colorWhite, $alpha: 0.4);
}

footer {
    display: block;
    padding: $windowPad 0 0;
    margin-bottom: -$boxPad;
    margin-top: $boxPad;
    background-color: $colorPrimaryDark;

    .layout-table {

        .layout-col {
            vertical-align: top;
            width: 40%;
            padding: 0 $boxPad;

            &:first-of-type {
                width: 20%;
                padding-left: 0;
            }
            &:last-of-type {
                padding-right: 0;
            }
        }
    }

    h6 {
        font-size: 1.2em;
    }

    ul {
        list-style: none;

        li {
            padding: 0.3em 0;
        }
    }
}

@media screen and (max-width: 480px) {
    footer {
        .layout-table {

            .layout-col {
                vertical-align: top;
                width: 50%;
                padding: 0 $boxPad;

                &:first-of-type {
                    display: none;
                    width: 0;
                }
                &:last-of-type {
                    padding-right: 0;
                }
            }
        }
    }
}

@media screen and (max-width: 380px) {
    footer {
        .layout-table {
            display: block;

            .layout-col {
                width: 100%;
                display: block;
                padding-left: 0;
                padding-right: 0;
                margin-bottom: $windowPad;

                &:last-of-type {
                    margin-bottom: 0;
                }
            }
        }
    }
}
</style>
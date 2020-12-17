<template>
    <section v-if="channel">

        <router-link custom v-slot="{ navigate }" :to="{name: 'home'}">
            <button class="btn btn-primary btn-m" @click="navigate">Zurück zur Startseite</button>
        </router-link>
        <br><br>

        <app-channel-showcase :small="true" :channel="channel"></app-channel-showcase>

        <div class="layout-grid">
            <div class="section-field transparent">
                <h4>Zuvor gespielt <v-lottie-player class="loader" width="24px" height="24px" loop autoplay :animationData="loaderData" v-if="history.loading"></v-lottie-player></h4>
                <app-textbox class="box-small" v-if="!history.loading && history.data.length == 0">Dieser Channel hat keine bereits gespielten Songs</app-textbox>

                <div class="list-grid-wrapper">
                    <transition-group name="animation_item_slide" mode="out-in">
                        <app-song-item v-for="(song) in sortedHistory" :key="song.title" :song="song"></app-song-item>
                    </transition-group>
                </div>
            </div>
            <div class="section-field transparent">
                <h4>Die Lyrics zum Song <span class="badge badge-s">Beta</span><v-lottie-player class="loader" width="24px" height="24px" loop autoplay :animationData="loaderData" v-if="lyrics.loading"></v-lottie-player></h4>
                <app-textbox class="box-small" v-if="!lyrics.loading && !lyrics.data">Für diesen Song sind keine Lyrics verfügbar</app-textbox>

                <transition name="animation_item_slide">
                    <div class="section-field inner" v-if="lyrics.data">
                        <p v-html="lyrics.data"></p>
                    </div>
                </transition>
            </div>
        </div>
    </section>
</template>

<script>
import loaderData from '@/assets/animated/primary_loader_light.json'

import AppChannelShowcase from '@/components/message/AppChannelShowcaseComp.vue'
import AppSongItem from '@/components/lists/AppSongItemComp.vue'

export default {
    data() {
        return {
            loaderData,
            history: {
                loading: true,
                data: []
            },
            lyrics: {
                loading: true,
                data: undefined
            }
        }
    },
    components: {
        AppChannelShowcase,
        AppSongItem
    },
    computed: {
        channel() {
            let channelUUID = this.$route.params.id
            let channel = this.$store.state.channels[channelUUID]
            return channel
        },
        sortedHistory() {
            let history = this.history.data
            return history.sort((x,y) => {
                return y.timestamp - x.timestamp
            })
        }
    },
    watch: {
        channel(val) {
            if(val) {
                let history = val.history

                if(history){
                    this.history.loading = false
                    this.history.data = history
                }

                this.getAndSubscribeHistory()
            }
        },
        'channel.info'() {
            this.getLyrics()
        }
    },
    methods: {
        getAndSubscribeHistory() {
            this.$channel.getHistory(this.channel.uuid).then((result) => {
                this.history.data = result.data
            }).finally(() => {
                this.history.loading = false

                this.$socket.on("history", (message) => {
                    if(message.uuid == this.channel.uuid) {
                        this.history.data = Object.values(message.history)
                    }
                })
            })
        },
        getLyrics() {
            if(this.channel) {
                this.lyrics.loading = true
                this.lyrics.data = undefined

                this.$channel.getLyrics(this.channel.info.title, this.channel.info.artist).then((result) => {
                    if(result.status == 200) {
                        this.lyrics.data = result.data.lyrics.replace("\n", "<br>")
                    }
                }).finally(() => {
                    this.lyrics.loading = false
                })
            }
        }
    },
    mounted() {
        let channelUUID = this.$route.params.id
        let channel = this.$store.state.channels[channelUUID]

        if(channel) {
            this.getAndSubscribeHistory()
            this.getLyrics()
        }
    },
    unmounted() {
        this.$socket.off("history")
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/lists.scss';

.loader {
    display: inline-block;
    vertical-align: middle;
    margin-left: 0.5em;
}

.list-grid-wrapper {
    grid-template-columns: 100%;

    .list-item-covered-wrapper {
        padding: 0.5em 0;
    }

    .list-item-covered {
        cursor: none !important;
    }
}

.section-field {
    background-color: rgba($color: $colorPrimaryDark, $alpha: 0.7);
    //box-shadow: $shadowNormal;
    border-radius: $borderRadSmall;
    padding: 1.2em;
    margin: 0;

    &:nth-child(odd) {
        margin-right: 1em;
    }
    &:nth-child(even) {
        margin-left: 1em;
    }

    &.inner {
        margin: 0;
    }

    &.transparent {
        background-color: transparent;
        padding-left: 0;
        padding-right: 0;
    }
}

.layout-grid {
    display: grid;
    width: 100%;
    grid-template-columns: 50% 50%;
    padding: 0;
    margin-top: -2em;
}

@media screen and (max-width: 580px) {
    .layout-grid {
        grid-template-columns: 100%;
    }
    .section-field {

        &:nth-child(odd) {
            margin-right: 0em;
        }
        &:nth-child(even) {
            margin-left: 0em;
        }
    }
}
</style>
<template>
    <section>
        <div class="content-section">
            <app-single-showcase-item class="channel" :channel="channel" :canSwitchMode="false" @selected="selectChannel"></app-single-showcase-item>
        </div>

        <div class="content-section">
            <div class="layout-table">
                <div class="layout-col section-history">
                    <h5 class="headline-container align-center">Zuletzt gespielt</h5>

                    <transition name="anim_item_fade" mode="out-in" appear>
                        <app-skeleton-grid class="small" v-if="isHistoryLoading"></app-skeleton-grid>
                        <div class="grid-wrapper small" v-else-if="history.length > 0">
                            <div class="grid-container">
                                <transition-group name="anim_item_slide" mode="out-in" appear>
                                    <app-grid-item v-for="track of history" :key="track.timestamp" :itemUuid="channel.uuid" :itemName="dateformat(new Date(parseInt(track.timestamp)), 'hh:MM') + ' Uhr'" :itemTitle="track.title" :itemSubtitle="track.artist" :itemColor="channel.colorHex" :itemTimestamp="track.timestamp + ''" :selectable="false" :isSong="true"></app-grid-item>
                                </transition-group>
                            </div>
                        </div>
                    </transition>
                </div>

                <div class="layout-col section-details">
                    <h5 class="headline-container align-center">Aktueller Songtext</h5>

                    <transition-group name="anim_item_fade" mode="out-in" appear>
                        <app-lyrics-skeleton v-if="lyrics.loading && !lyrics.content && channel?.lyricsEnabled"></app-lyrics-skeleton>

                        <app-info-box v-if="!lyrics.content && !lyrics.loading && channel?.lyricsEnabled">
                            Wir konnten keine Lyrics für diesen Song finden
                        </app-info-box>

                        <app-info-box v-if="channel && !channel?.lyricsEnabled">
                            Für diesen Channel ist die Suche nach Songtexten deaktiviert
                        </app-info-box>

                        <div class="lyrics-list" v-if="lyrics.content && !lyrics.loading && channel?.lyricsEnabled">
                            <div class="lyrics-container" v-for="(content, key) in lyrics.content" :key="content">
                                <h6 v-if="typeof key != 'number' && key != ''">{{ key }}</h6>
                                <p v-if="content != ''">{{ content }}</p>
                            </div>
                        </div>
                    </transition-group>
                    
                </div>
            </div>
        </div>

        <div class="content-section" v-if="recommendedChannels.length > 0">
            <h5 class="headline-container align-center">Diese Channels könnten dir gefallen</h5>

            <transition name="anim_item_fade" mode="out-in" appear>
                <app-skeleton-grid class="" v-if="isHistoryLoading"></app-skeleton-grid>
                <div class="grid-wrapper" v-else>
                    <div class="grid-container">
                        <transition-group name="anim_item_slide" mode="out-in" appear>
                            <app-grid-item v-for="channel of recommendedChannels" :key="channel.uuid" :itemUuid="channel.uuid" :itemName="channel.title" :itemTitle="channel.info?.title" :itemSubtitle="channel.info?.artist" :itemListeners="channel.listeners" :itemColor="channel.colorHex" :itemTimestamp="channel.info?.cover" @selected="selectChannel(channel.uuid)"></app-grid-item>
                        </transition-group>
                    </div>
                </div>
            </transition>
        </div>
        
    </section>
</template>

<script>
import { TrustedError } from '@/models/api'
import { RouterUtil } from '@/utils/routerUtil'

import AppGridItem from '@/components/item/AppGridItem.vue'
import AppSkeletonGrid from '@/components/grids/AppSkeletonGrid.vue'
import AppInfoBox from '@/components/message/AppInfoBox.vue'
import AppLyricsSkeleton from '@/components/text/AppLyricsSkeleton.vue'
import AppSingleShowcaseItem from '@/components/item/AppSingleShowcaseItem.vue'

export default {
    data() {
        return {
            lyrics: {
                loading: true,
                content: undefined
            },
            isHistoryLoading: true,
            channelId: undefined
        }
    },
    components: {
        AppGridItem,
        AppSkeletonGrid,
        AppInfoBox,
        AppLyricsSkeleton,
        AppSingleShowcaseItem
    },
    computed: {
        channel() {
            return this.$store.state.channels[this.channelId]
        },
        channelAsArray() {
            if(!this.channel) return []
            var array = []
            array.push(this.channel)
            return array
        },
        history() {
            if(this.channel?.history) {
                var values = this.channel.history
                return values.sort((a, b) => b.timestamp - a.timestamp)
            } else {
                return []
            }
        },
        recommendedChannels() {
            var channels = []

            var availableChannels = Object.values(this.$store.state.channels).filter((channel) => channel && channel.enabled && !!channel.activeSince && channel.uuid != this.channel?.uuid)
            var maxEntries = availableChannels.length < 4 ? availableChannels.length : 4

            for(var i = 0; i < maxEntries; i++) {
                var rndIndex

                do {
                    rndIndex = Math.round(Math.random() * (availableChannels.length - 1))
                } while (channels.includes(availableChannels[rndIndex]))

                channels.push(availableChannels[rndIndex])
            }

            return channels
        }
    },
    watch: {
        '$route.params.channelId'(val) {
            if(val) {
                this.isHistoryLoading = true
                this.channelId = val
            }
        },
        'channel.info'() {
            this.fetchLyrics()
        },
        channel(val) {
            if(val) {
                this.channelId = this.$route.params.channelId
                this.$channel.getHistory(val.uuid)

                RouterUtil.setPageTitle(val.title)
            }
        },
        history(val) {
            if(val) {
                this.isHistoryLoading = false
            }
        }
    },
    methods: {
        fetchLyrics() {
            if(!this.channel) return
            if(!this.channel.lyricsEnabled) return

            this.lyrics.loading = true
            this.lyrics.content = undefined

            this.$channel.getLyrics(this.channel.uuid).then((result) => {
                // Can be object or array

                if(result instanceof TrustedError) {
                    this.lyrics.content = undefined
                } else {
                    if(Array.isArray(result.data)) {
                        if(result.data.length <= 0) {
                            this.lyrics.content = undefined
                        } else {
                            this.lyrics.content[""] = result.data
                        }
                    } else {
                        if(Object.keys(result.data).length <= 0) {
                            this.lyrics.content = undefined
                        } else {
                            this.lyrics.content = result.data
                        }
                    }
                }
            }).finally(() => {
                this.lyrics.loading = false
            })
        },
        selectChannel(uuid) {
            this.$channel.select(uuid)
        }
    },
    activated() {
        this.channelId = this.$route.params.channelId
    },
    mounted() {
        this.channelId = this.$route.params.channelId

        if(this.channel) {
            this.$channel.getHistory(this.channel.uuid)
            this.fetchLyrics()
        }
    },
    unmounted() {
        setTimeout(() => {
            if(this.channelId) this.channelId = undefined
        }, 260)
    },
    deactivated() {
        setTimeout(() => {
            this.channelId = undefined
        }, 260)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/elements/lists.scss";

.headline-container {
    background-color: $colorPlaceholder;
    padding: $boxPad;
    margin: $boxPad*3 0 $boxPad 0;
    border-radius: $borderRadSmall;
    font-size: 1.1em;
    font-weight: 700;

    &.align-center {
        text-align: center;
    }
}

.channel {
    height: 20em;
    width: 100%;
}

.layout-table {
    .layout-col {
        width: 50%;
        vertical-align: top;

        &.section-history {
            padding-right: $boxPad/2;
        }

        &.section-details {
            padding-left: $boxPad/2;
        }
    }
}

.lyrics-list {
    display: block;
    padding: $boxPad;
    width: 100%;
    background-color: $colorPrimaryDark;
    border-radius: $borderRadSmall;

    .lyrics-container {
        display: block;
        background-color: $colorPrimary;
        border-radius: $borderRadSmall;
        padding: $boxPad;
        width: 100%;
        margin: $boxPad 0;

        h6 {
            text-transform: uppercase;
            font-weight: 600;
            text-align: center;
        }

        p {
            margin-top: 1em;
            line-height: 1.8em;
        }
    }
}

@media screen and (max-width: 800px) {
    .layout-table {
        display: block !important;

        .layout-col {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;

            &.section-details {
                padding-top: $windowPad;
            }
        }
    }
}

@media screen and (max-width: 700px) {
    .showcase {
        margin-bottom: 3em !important;
    }
}
</style>
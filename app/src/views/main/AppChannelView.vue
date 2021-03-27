<template>
    <section>
        <app-single-showcase-item class="channel" :channel="channel" :canSwitchMode="false" @selected="selectChannel"></app-single-showcase-item>

        <div class="layout-table">
            <div class="layout-col section-history">
                <h4>Zuletzt gespielt</h4>

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
                <h4>Aktueller Songtext</h4>

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
        }
    },
    watch: {
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

.channel {
    margin-bottom: 3em;
    height: 20em;
}

.layout-table {
    .layout-col {
        width: 50%;
        vertical-align: top;

        h4 {
            margin-bottom: 0.8em;
        }

        &.section-history {
            padding-right: $windowPad;
        }

        &.section-details {
            padding-left: $windowPad;
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


@media screen and (max-width: 900px) {
    .layout-table {
        .layout-col {
            &.section-history {
                padding-right: $windowPad/2;
            }

            &.section-details {
                padding-left: $windowPad/2;
            }
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
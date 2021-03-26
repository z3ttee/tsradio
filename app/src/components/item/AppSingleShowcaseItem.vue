<template>
    <div :class="{'showcase state-single': true, 'state-tabletmode': $store.state.app.isTabletMode && canSwitchMode}">
        <div class="showcase-wrapper">
            <div class="showcase-container" :id="itemId">
                <div :class="{'showcase-item': true, 'state-active': $channel.isActive(channel.uuid)}" @click="select(channel.uuid)" :style="channel.colorHex ? 'border-color: ' + channel.colorHex +  ';' : ''">
                    <app-placeholder-image class="item-background" :resourceId="channel.uuid" :resourceType="'song'" :resourceKey="channel.info?.cover"></app-placeholder-image>

                    <div class="item-background-overlay"></div>
                    <div class="item-content">
                        <div class="item-title">
                            <app-wrappable-headline :accentColorHex="channel?.colorHex">
                                <template #subtitle>{{ channel?.description }}</template>
                                <template #title>{{ channel?.title }}</template>
                            </app-wrappable-headline>
                            <app-listener-counter :listeners="channel?.listeners"></app-listener-counter>
                        </div>

                        <div class="item-details">
                            <app-song-details :accentColorHex="channel.colorHex">
                                <template #sectionTitle>Gerade läuft</template>
                                <template #songTitle>{{ channel?.info?.title }}</template>
                                <template #songArtist>{{ channel?.info?.artist }}</template>
                            </app-song-details>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
    </div>
</template>

<script>
import clamp from 'clamp-js'

import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'
import AppSongDetails from '@/components/text/AppSongDetails.vue'
import AppListenerCounter from '@/components/text/AppListenerCounter.vue'
import AppWrappableHeadline from '@/components/text/AppWrappableHeadline.vue'

export default {
    components: {
        AppSongDetails,
        AppListenerCounter,
        AppWrappableHeadline,
        AppPlaceholderImage
    },
    props: {
        channel: {
            type: Object,
            default: () => { return {} }
        },
        canSwitchMode: {
            type: Boolean,
            default: true
        }
    },
    emits: ['selected'],
    data() {
        return {
            itemId: this.generateId(6),
            observer: undefined
        }
    },
    methods: {
        select(uuid) {
            if(!uuid) return
            this.$emit('selected', uuid)
        }
    },
    mounted() {
        setTimeout(() => {
            this.observer = new ResizeObserver(() => {
                if(this.$store.state.app.isTabletMode) return

                try {
                    clamp(document.getElementById(this.channel.uuid+'description'), {clamp: 2, useNativeClamp: true, animate: true})
                    clamp(document.getElementById(this.channel.uuid+'title'), {clamp: 2, useNativeClamp: true, animate: true})
                } catch (error) { 
                    /* Do nothing */ 
                    this.observer = undefined
                }
            })
            this.observer.observe(document.getElementById(this.itemId))
        }, 500)
    }
}
</script>

<style lang="scss">
@import "@/assets/scss/items/showcaseItem.scss";
</style>
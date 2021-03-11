<template>
    <div :class="{'showcase': true, 'state-tabletmode': $store.state.app.isTabletMode, 'state-single': channels?.length == 1}">
        <div class="showcase-wrapper">
            <div class="showcase-container" :id="itemId">
                <div :class="{'showcase-item': true, 'state-active': $channel.isActive(channel.uuid)}" v-for="channel of channels" :key="channel.uuid" @click="select(channel.uuid)" :style="channel.colorHex ? 'border-color: ' + channel.colorHex +  ';' : ''">
                    <app-placeholder-image class="item-background" :placeholder="backgroundImagePlaceholder" :src="buildChannelCurrentUrl(channel.uuid)" :cacheKey="channel.info?.cover"></app-placeholder-image>

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

        <div class="item-divider"></div>

        <div class="grid-wrapper" v-if="channels.length > 0">
            <div class="grid-container">
                <transition-group name="anim_item_slide" mode="out-in" appear>
                    <app-grid-item v-for="channel of channels" :key="channel.uuid" :itemUuid="channel.uuid" :itemName="channel.title" :itemTitle="channel.info?.title" :itemSubtitle="channel.info?.artist" :itemListeners="channel.listeners" :itemColor="channel.colorHex" @selected="selectChannel($event, channel.uuid)"></app-grid-item>
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script>
import clamp from 'clamp-js'
import * as backgroundImagePlaceholder from '@/assets/images/branding/ts_cover_placeholder.jpeg'

import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'
import AppGridItem from '@/components/item/AppGridItem.vue'
import AppSongDetails from '@/components/text/AppSongDetails.vue'
import AppListenerCounter from '@/components/text/AppListenerCounter.vue'
import AppWrappableHeadline from '@/components/text/AppWrappableHeadline.vue'


export default {
    components: {
        AppGridItem,
        AppSongDetails,
        AppListenerCounter,
        AppWrappableHeadline,
        AppPlaceholderImage
    },
    props: {
        channels: {
            type: Array,
            default: () => { return [] }
        }
    },
    emits: ['selected'],
    data() {
        return {
            itemId: this.generateId(6),
            observer: undefined,
            backgroundImagePlaceholder
        }
    },
    methods: {
        select(uuid) {
            this.$emit('selected', uuid)
        }
    },
    mounted() {
        setTimeout(() => {
            this.observer = new ResizeObserver(() => {
                if(this.$store.state.app.isTabletMode) return

                try {
                    for(const channel of this.channels) {
                        clamp(document.getElementById(channel.uuid+'description'), {clamp: 2, useNativeClamp: true, animate: true})
                        clamp(document.getElementById(channel.uuid+'title'), {clamp: 2, useNativeClamp: true, animate: true})
                    }
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

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/elements/lists.scss";

.item-divider {
    position: absolute;
    top: 50%;
    left: 49%;
    z-index: 1000;

    height: 150%;
    transform: translate(-50%,-50%) skew(-34.5deg);

    padding: 0.3em;
    background-color: $colorAccent;
    transition: all $animSpeedFast*1s $cubicNorm;
}

.showcase {
    margin: $windowPad/2 0;
    display: block;
    position: relative;
    padding-top: 25%;

    background-color: $colorPlaceholder;
    overflow: hidden;
    border-radius: $borderRadSmall;

    &.state-single {
        .item-divider {
            display: none;
        }
    }

    &.state-tabletmode {
        background: none;
        margin: 0;
        padding: 0;
        box-shadow: none;

        .showcase-wrapper {
            visibility: hidden !important;
            pointer-events: none;
        }

        .grid-wrapper {
            display: initial;
        }
    }

    .grid-wrapper {
        display: none;
    }
}

.grid-wrapper {
    margin: 0;
    margin-bottom: -1em;
}

.showcase-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.showcase-container {
    position: absolute;
    display: inline-block;
    width: 100%;
    height: 100%;

    .showcase-item {
        position: absolute;
        top: 0;
        left: 0;
        display: inline-block;
        vertical-align: middle;
        width: 60%;
        height: 100%;
        overflow: hidden;
        padding: 1em;
        z-index: 11;

        border: 3px solid $colorPlaceholder;
        border-style: none;
        transition: all $animSpeedFast*1s $cubicNorm;

        cursor: pointer;

        &.state-active {
            border-style: solid;
        }

        &:first-of-type {
            left: 0;
            clip-path: polygon(0 0, 100% 0%, 70% 100%, 0% 100%);
            border-top-left-radius: $borderRadSmall;
            border-bottom-left-radius: $borderRadSmall;
        }

        &:last-of-type {
            left: 40%;
            text-align: right;
            clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);
            border-top-right-radius: $borderRadSmall;
            border-bottom-right-radius: $borderRadSmall;
        }

        &:first-of-type:last-of-type {
            clip-path: none !important;
            left: 0 !important;
            width: 100% !important;
            text-align: left !important;

            .item-content {
                width: 100%;
            }
        }

        &:hover {
            .item-background {
                transform: scale(1.1);
            }
        }

        .item-content {
            display: inline-block;
            position: relative;
            height: 100%;
            width: 60%;
            z-index: 2;
        }

        .item-details {
            position: absolute;
            bottom: 0%;
            right: 0;
            left: 0;
            font-size: 1.1em;
        }

        .item-background {
            display: block;
            left: 0;
            top: 0;
            bottom: 0;
            right: 0;
            position: absolute;
            
            background-position: center;
            background-size: cover;
            filter: blur(2px);
            z-index: 0;

            transition: all $animSpeedNormal*1s $cubicNorm;
        }

        .item-background-overlay {
            display: block;
            left: 0;
            top: 0;
            bottom: 0;
            right: 0;
            position: absolute;
            z-index: 1;

            $colorGrad: $colorPrimaryDarker;
            background: linear-gradient(0deg, rgba($color: $colorGrad, $alpha: 1) 0%, rgba($color: $colorGrad, $alpha: 0.8) 50%, rgba($color: $colorGrad, $alpha: 1) 100%);
        }
    }
}

@media screen and (max-width: 900px) {
    .showcase {
        padding-top: 30%;
    }

    .item-divider {
        transform: translate(-50%,-50%) skew(-29.5deg);
    }
}

@media screen and (max-width: 700px) {
    .showcase {
        padding: 0 !important;
        margin: $windowPad/2 0 !important;
    }

    .item-divider {
        display: none;
    }
}

@media screen and (max-width: 500px) {
    .showcase {
        padding: 0 !important;
        margin: 0 !important;
        margin-bottom: -1em !important;
    }
}
</style>
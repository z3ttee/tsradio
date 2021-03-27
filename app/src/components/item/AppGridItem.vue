<template>
    <div :class="{'item': true, 'state-disabled': disabled}" :id="itemId + 'content'">
        <div class="item-wrapper-color" :style="itemColor ? 'background-color: ' + itemColor +  ';' : ''"></div>
        
        <div :class="{'item-wrapper': true, 'state-disabled': disabled, 'state-active': !disabled && $channel.isActive(itemUuid) && selectable}">
            <div class="item-background">
                <app-placeholder-image class="background-image" :resourceId="itemUuid" :timestamp="isSong ? itemTimestamp : undefined" :resourceType="isSong ? 'history' : 'song'" :resourceKey="itemTimestamp"></app-placeholder-image>
                <div class="background-overlay"></div>
            </div>
            <div class="item-container" @click="select" :style="itemColor ? 'border-color: ' + itemColor +  ';' : ''">
                <div class="item-header">
                    <app-placeholder-image class="header-icon" :resourceId="itemUuid" :resourceType="'cover'"></app-placeholder-image>
                    <div class="header-title">
                        <h5 :id="itemId+'channel'">{{ itemName }}</h5>
                    </div>
                </div>

                <div class="item-details" v-if="itemListeners != undefined">
                    <app-listener-counter :listeners="itemListeners"></app-listener-counter>
                </div>

                <app-song-details class="item-info">
                    <template #songTitle>{{ itemTitle }}</template>
                    <template #songArtist>{{ itemSubtitle }}</template>
                </app-song-details>
            </div>
        </div>

    </div>
</template>

<script>
import clamp from 'clamp-js'

import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'
import AppSongDetails from '@/components/text/AppSongDetails.vue'
import AppListenerCounter from '@/components/text/AppListenerCounter.vue'

export default {
    components: {
        AppSongDetails,
        AppListenerCounter,
        AppPlaceholderImage
    },
    data() {
        return {
            itemId: this.generateId(6),
            observer: undefined
        }
    },
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        selectable: {
            type: Boolean,
            default: true
        },
        isSong: {
            type: Boolean,
            default: false
        },
        itemUuid: String,
        itemName: String,
        itemTitle: String,
        itemSubtitle: String,
        itemListeners: Number,
        itemColor: String,
        itemTimestamp: String
    },
    emits: ['selected'],
    methods: {
        select() {
            if(!this.disabled && this.selectable) this.$emit('selected')
        }
    },
    mounted() {
        setTimeout(() => {
            this.observer = new ResizeObserver(() => {
                try {
                    clamp(document.getElementById(this.itemId + 'channel'), {clamp: 0, useNativeClamp: true, animate: true})
                    clamp(document.getElementById(this.itemId + 'channel'), {clamp: 2, useNativeClamp: true, animate: true})
                } catch (error) { 
                    /* Do nothing */ 
                    this.observer = undefined
                }
            })
            if(document.getElementById(this.itemId+'content')) {
                this.observer.observe(document.getElementById(this.itemId+'content'))
            }
            
        }, 100)
    },
    unmounted() {
        try {
            if(document.getElementById(this.itemId+'content')) {
                this.observer.unobserve(document.getElementById(this.itemId+'content'))
            }
        } catch (error) { /* Do nothing */ }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

$itemHeaderHeight: 64px;
$borderRad: $borderRadSmall;

@mixin absWithFullHeight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

@mixin transition {
    transition: all $animSpeedNormal*1s ease;
}

.item {
    position: relative;
    align-self: stretch;
    display: inline-block;
    width: 100%;
    padding-top: 100%;

    .item-wrapper-color {
        @include absWithFullHeight();
        content: "";
        background-color: $colorAccentLight;
        transition: all 0.1s linear;
        border-radius: $borderRad+2px;

    }

    &.state-disabled {
        opacity: 0.5;

        .item-wrapper {
            cursor: not-allowed;
        }
    }

    .item-wrapper {
        @include absWithFullHeight();
        cursor: pointer;
        box-shadow: $shadowNormal;

        &.state-active {
            .item-container {
                border-style: solid !important;
            }
        }

        .item-container {
            
            @include transition();
            height: 100%;
            z-index: 3;
            position: relative;
            border-radius: $borderRad;
            overflow: hidden;
            border: 3px none transparent;
        }

        .item-background {
            @include absWithFullHeight();
            @include transition();
            z-index: 3;
            border-radius: $borderRad;
            overflow: hidden;
            background-color: $colorPlaceholder;

            .background-image {
                @include absWithFullHeight();
                border-radius: $borderRad+3px;
            }
            .background-overlay {
                @include absWithFullHeight();
                border-radius: $borderRad;
                $colorGrad: $colorPrimaryDarker;
                background: linear-gradient(0deg, rgba($color: $colorGrad, $alpha: 1) 0%, rgba($color: $colorGrad, $alpha: 0.7) 50%, rgba($color: $colorGrad, $alpha: 1) 100%);
            }
        }

        &:hover:not(.state-disabled) {
            .item-container,
            .item-background {
                transform: translate(5px, -5px);
            }
        }
    
        .item-header {
            position: relative;
            display: inline-block;
            width: 100%;
            min-height: $itemHeaderHeight;

            .header-icon {
                position: absolute;
                top: 0px;
                left: 0;
                width: $itemHeaderHeight;
                height: $itemHeaderHeight;
                border-bottom-right-radius: $borderRad;

                background-attachment: scroll;
                background-position: center;
                background-size: cover;
                
                img {
                    display: inline-block;
                    width: inherit;
                    height: inherit;
                    vertical-align: middle;
                }
            }
            .header-title {
                display: block;
                width: 100%;
                
                text-align: right;
                padding: 0.8em;
                padding-left: $itemHeaderHeight + 10px;
                
                h5 {
                    font-weight: 700 !important;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                }

                word-break: break-all;
            }
        }

        .item-details {
            position: absolute;
            left: 0;
            top: $itemHeaderHeight + 5px;
            width: $itemHeaderHeight;
            color: $colorAccentLight;
            text-align: center;
        }

        .item-info {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: $boxPad;
        }
    }
}

@media screen and (max-width: 500px) {
    .item {
        margin-bottom: 16px;
        padding-top: 0;

        .item-wrapper {
            position: static;
            height: 170px;

            &::after {
                display: none !important;
            }

            &:hover:not(.state-disabled) {
                .item-container,
                .item-background {
                    transform: none !important;
                }
            }
        }

        .item-container {
            border-width: 2px !important;
        }

        .header-title {
            text-align: left !important;
        }

        .background-overlay {
            @include absWithFullHeight();
            border-radius: $borderRadNormal;
            $colorGrad: $colorPrimaryDarker;
            background: linear-gradient(0deg, rgba($color: $colorGrad, $alpha: 1) 10%, rgba($color: $colorGrad, $alpha: 0.8) 50%, rgba($color: $colorGrad, $alpha: 1) 100%) !important;
        }
    }
}
</style>
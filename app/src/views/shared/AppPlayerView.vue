<template>
    <div :class="{'player-wrapper': true, 'state-hidden': !$store.state.activeChannel }" id="playerbar" @click="toggle">
        <div class="content-container">
            <div class="layout-table">
                <div class="layout-col">
                    <app-placeholder-image class="track-cover" :placeholder="backgroundImagePlaceholder" :src="buildChannelCurrentUrl(channel?.uuid)" :cacheKey="channel?.info?.cover"></app-placeholder-image>
                </div>
                <div class="layout-col">
                    <p>{{ channel?.info?.title }}</p>
                    <p>{{ channel?.info?.artist }}</p>
                </div>
                <div class="layout-col">
                    <div class="actions">
                        <div class="action-item">
                            <app-play-button :paused="player?.paused" :loading="player?.loading" @paused="player.paused = true" @resumed="player.paused = false"></app-play-button>
                        </div>

                        <!--<div :class="{'action-item': true, 'state-loading': player?.loadingVote}">
                            <app-loader class="loader voting-loader"></app-loader>
                            <button class="btn btn-icon btn-m"><img src="@/assets/icons/next.svg" alt=""></button>
                        </div>-->
                        <div class="action-item">
                            <transition name="animation_item_scale" mode="out-in">
                                <button class="btn btn-icon btn-m" @click="toggleMute" v-if="player.volume > 0"><img src="@/assets/icons/speaker.svg" alt=""></button>
                                <button class="btn btn-icon btn-m" @click="toggleMute" v-else><img src="@/assets/icons/mute-speaker.svg" alt=""></button>
                            </transition>

                            <input orient="vertical" type="range" max="60" min="0" v-model="player.volume">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <audio :id="audioElementId" :src="getStreamUrl()" controls autoplay @pause="eventPaused" @canPlay="eventCanPlay" @ended="eventEnded" @play="eventPlay" @error.prevent="eventError"></audio>
    </div>
</template>

<script>
import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'
import AppPlayButton from '@/components/button/AppPlayButtonComp.vue'

import * as backgroundImagePlaceholder from "@/assets/images/branding/ts_cover_placeholder.jpeg"


export default {
    components: {
        AppPlayButton,
        AppPlaceholderImage
    },
    data() {
        return {
            audioElementId: this.generateId(6),
            backgroundImagePlaceholder,
            player: {
                paused: false,
                loading: true,
                volume: 30,
                loadingVote: false
            }
        }
    },
    computed: {
        channel() {
            return this.$store.state.activeChannel
        }
    },
    watch: {
        channel() {
            this.player.loading = true
            this.player.paused = false
            this.player.volume = localStorage.getItem('tsr_volume_'+this.channel?.uuid) || 30
        },
        'player.paused'(val) {
            let element = document.getElementById(this.audioElementId)
            if(!element) return
            if(val) {
                element.pause()
            } else {
                element.play()
            }
        },
        'player.volume'(val) {
            let element = document.getElementById(this.audioElementId)
            if(!element) return
            
            setTimeout(() => {
                localStorage.setItem('tsr_volume_'+this.channel?.uuid, val);
                element.volume = val/100;
            }, 50);
        }
        /*'player.paused'(val) {
            let element = document.getElementById(this.audioElementId)

            if(!element) return
            if(val) {
                element.pause()
            } else {
                element.play()
            }
        },
        'player.volume'(val) {
            let element = document.getElementById(this.audioElementId)
            if(!element) return
            
            setTimeout(() => {
                localStorage.setItem('tsr_volume_'+this.channel.uuid, val);
                element.volume = val/100;
            }, 50);
        },*/
    },
    methods: {
        eventError() {
            this.player.paused = true
            this.player.loading = false
        },
        eventPaused() {
            this.player.paused = true
            this.player.loading = false
            this.changeSource(true)
        },
        eventPlay() {
            this.player.paused = false
        },
        eventCanPlay(event) {
            this.player.loading = false
            event.target.play()
        },
        eventEnded() {
            this.player.loading = true
            this.changeSource(false)
        },
        toggle() {
            this.player.loading = false
            this.player.paused = !this.player.paused
            if(!this.player.paused) {
                this.changeSource(false)
            } else {
                this.changeSource(true)
            }
        },
        toggleMute() {
            this.player.volume = this.player.volume == 0 ? 30 : 0
        },
        getStreamUrl(){
            if(!this.channel?.mountpoint) return ""
            return this.$store.state.streamBaseUrl + this.channel?.mountpoint + "?token=" + this.$store.state.account.session + "&channel=" + this.channel?.uuid
        },
        changeSource(clear = false){
            console.log("Change source. Clear?", clear)
            /*let element = document.getElementById(this.audioElementId)
            if(!element) return
            if(clear) {
                element.setAttribute('src', '')
            } else {
                this.player.loading = true
                element.setAttribute('src', this.getStreamUrl())
                element.volume = this.player.volume / 100
                element.load()
            }*/
        }
        /*eventPaused() {
            this.player.paused = true
            this.player.loading = false
            console.log("eventPaused")
            this.changeSource(true)
        },
        eventCanPlay(event) {
            this.player.loading = false
            event.target.play()
        },
        eventEnded() {
            this.player.loading = true
        },
        eventPlay() {
            //this.changeSource(false)
            this.player.paused = false
        },
        eventError() {

        },
        toggleMute() {
            this.player.volume = this.player.volume == 0 ? this.getChannelVolume() : 0
        },
        changeSource(clear = false){
            let element = document.getElementById(this.audioElementId)
            if(!element) return
            if(clear) {
                element.setAttribute('src', '')
            } else {
                this.player.loading = true
                element.setAttribute('src', this.getStreamUrl())
                element.volume = this.player.volume / 100
                element.load()
            }
        },
        getChannelVolume() {
            return localStorage.getItem('tsr_volume_'+this.channel.uuid) || 30
        },
        toggle() {

        },
        getStreamUrl() {
            if(!this.channel?.mountpoint) {
                return ""
            }

            return this.$store.state.streamBaseUrl + this.channel?.mountpoint + "?token=" + this.$store.state.account.session + "&channel=" + this.channel.uuid
        }*/
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.player-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: $colorPrimary;
    z-index: 10000;
    transition: all $animSpeedNormal*1s $cubicNorm;

    opacity: 1;
    transform: translateY(0);

    border-top: 2px solid $colorPlaceholder;

    &.state-hidden {
        pointer-events: none;
        transform: translateY(10px);
        opacity: 0;
    }

    .layout-table {
        padding: 1em 0;
        .layout-col {
            vertical-align: middle;
            border: 1px solid red;

            &:first-of-type {
                width: 45px;
                height: 45px;

                .track-cover {
                    display: inline-block;
                    width: 100%;
                    height: 45px;
                    background-position: center;
                    background-size: cover;
                    background-color: $colorPlaceholder;
                    border-radius: $borderRadSmall;
                    box-shadow: $shadowNormal;
                }
            }

            &:not(:first-of-type):not(:last-of-type) {
                padding: 0 0.5em;

                p {
                    font-family: 'Poppins';
                    font-size: 0.95em;
                    line-height: 1.5em;

                    &:first-of-type {
                        font-weight: 600;
                        letter-spacing: 0.3px;
                    }

                    &:last-of-type {
                        opacity: 0.5;
                        font-weight: 400;
                        font-size: 0.8em;
                    }
                }
            }

            &:last-of-type {
                text-align: right;
                width: 300px;
            }
        }
    }
}

.action-item {
    position: relative;
    display: inline-block;
    transition: all $animSpeedFast*1s $cubicNorm;

    &.state-loading {
        button {
            transform: scale(0.8);
        }

        .loader {
            height: 45px !important;
            width: 45px !important;
        }
    }
}

.loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    display: inline-block;
    transition: all $animSpeedFast*1s $cubicNorm;
}

input[type=range] {
    -webkit-appearance: none;
    appearance: none;
    width: 80px;
    height: 4px;
    background: $colorPlaceholder;
    outline: none;
    
    &:hover {
        opacity: 1;
        cursor: pointer;
    }
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: $colorAccent;
        border-radius: 50%;
        transition: all $animSpeedFast*1s $cubicNorm;
    }
        
    &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: $colorAccent;
        transition: all $animSpeedFast*1s $cubicNorm;
    }
}
</style>
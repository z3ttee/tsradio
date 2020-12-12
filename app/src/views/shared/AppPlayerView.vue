<template>
    <div class="playerbar-wrapper">
        <div class="content-container playerbar-container">
            <div class="player-col player-details">
                <h4 :id="itemID+'title'">{{ selectedChannel.info.title }} </h4>
                <span :id="itemID+'artist'">{{ selectedChannel.info.artist }}</span>
            </div>
            <div class="player-col" :id="itemID+'col'">
                <div class="player-controls">
                    <audio :id="audioElementID" :src="getStreamURL()" hidden autoplay @pause="eventPaused" @canPlay="eventCanPlay" @ended="eventEnded" @play="eventPlay"></audio>
                    <button class="btn btn-icon btn-m btn-noscale" @click="toggle">
                        <transition name="animation_item_scale" mode="out-in">
                            <img src="@/assets/images/icons/pause.svg" v-if="!paused">
                            <img src="@/assets/images/icons/play.svg" v-else>
                        </transition>
                        <span class="loadingIndicator" v-if="loading"><v-lottie-player width="64px" height="64px" loop autoplay :animationData="loader"></v-lottie-player></span>
                    </button>
                    <button class="btn btn-icon btn-m btn-noscale" @click="sendVote">
                        <img src="@/assets/images/icons/skip.svg">
                    </button>
                    <button id="buttonSpeaker" class="btn btn-icon btn-m btn-noscale" @click="toggleMute">
                        <transition name="animation_item_scale" mode="out-in">
                            <img src="@/assets/images/icons/speaker.svg" v-if="volume > 0">
                            <img src="@/assets/images/icons/mute-speaker.svg" v-else>
                        </transition>
                    </button>
                    <input orient="vertical" type="range" max="60" min="0" v-model="volume">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import channeljs from '@/models/channel.js'
import loader from '@/assets/animated/primary_loader_light.json'
import config from '@/config/config.js'
import clamp from 'clamp-js'

export default {
    data() {
        return {
            loader,
            paused: false,
            loading: true,
            volume: 30,
            audioElementID: this.makeid(6),
            observer: undefined,
            itemID: this.makeid(6)
        }
    },
    methods: {
        eventPaused() {
            this.paused = true
            this.loading = false
            this.changeSource(true)
        },
        eventPlay() {
            this.paused = false
        },
        eventCanPlay(event) {
            this.loading = false
            event.target.play()
        },
        eventEnded() {
            this.loading = true
            this.changeSource(false)
        },
        toggle() {
            this.loading = false
            this.paused = !this.paused

            if(!this.paused) {
                this.changeSource(false)
            } else {
                this.changeSource(true)
            }
        },
        toggleMute() {
            this.volume = this.volume == 0 ? 30 : 0
        },
        getStreamURL(){
            let path = this.selectedChannel.path
            let streamURL = config.api.streamBase + path.replace("/", "")+"?"+this.$store.state.jwt+"&"+this.$store.state.user.uuid+"&"+this.selectedChannel.uuid;
            return streamURL
        },
        changeSource(clear = false){
            let element = document.getElementById(this.audioElementID)
            if(!element) return

            if(clear) {
                element.setAttribute('src', '')
            } else {
                this.loading = true
                element.setAttribute('src', this.getStreamURL())
                element.volume = this.volume / 100
                element.load()
            }
        },
        changePageBackground() {
            if(this.selectedChannel) {
                let pageBackground = document.getElementById("pageBackground")
                let coverURL = config.api.baseURL+'artworks/'+this.selectedChannel.uuid+'.png?key='+this.makeid(4)
                pageBackground.style.backgroundImage = "url('"+coverURL+"')"
            }
        },
        sendVote(){
            channeljs.sendVoteSkip(this.$store.state.currentChannel.uuid)
        }
    },
    watch: {
        paused(val) {
            let element = document.getElementById(this.audioElementID)
            if(!element) return

            if(val) {
                element.pause()
            } else {
                element.play()
            }
        },
        volume(val) {
            let element = document.getElementById(this.audioElementID)
            if(!element) return
            
            setTimeout(() => {
                localStorage.setItem('tsr_volume_'+this.selectedChannel.uuid, val);
                element.volume = val/100;
            }, 50);
        },
        selectedChannel() {
            if(this.selectedChannel) {
                var volume = localStorage.getItem('tsr_volume_'+this.selectedChannel.uuid);
                if(volume) this.volume = volume;
                else this.volume = 50;

                this.loading = true
            }
        },
        'selectedChannel.info'() {
            this.changePageBackground()
        }
    },
    computed: {
        selectedChannel() {
            return this.$store.state.currentChannel
        }
    },
    mounted(){
        this.changeSource(false)

        this.observer = new ResizeObserver(() => {
            try {
                clamp(document.getElementById(this.itemID+'title'), {clamp: 0, useNativeClamp: true, animate: true})
                clamp(document.getElementById(this.itemID+'title'), {clamp: 1, useNativeClamp: true, animate: true})
                clamp(document.getElementById(this.itemID+'artist'), {clamp: 0, useNativeClamp: true, animate: true})
                clamp(document.getElementById(this.itemID+'artist'), {clamp: 1, useNativeClamp: true, animate: true})
            } catch (error) { 
                /* Do nothing */ 
                this.observer = undefined
            }
        })
        this.observer.observe(document.getElementById(this.itemID+'col'))
        this.changePageBackground()
    },
    unmounted() {
        try {
            this.observer.unobserve(document.getElementById(this.itemID+'col'))
        } catch (error) { /* Do nothing */ }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

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

.loadingIndicator {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 64px;
    height: 64px;
    transform: translate(-50%,-50%);
}

.playerbar-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: $gradientBoxDark;
    height: 80px;
    border-top: 2px solid $colorPlaceholder;
    box-shadow: $shadowHeavy;
}
.playerbar-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .player-col {
        width: 100%;
        
        &:first-of-type {
            padding-right: 3em;
        }
        &:last-of-type {
            position: relative;
            text-align: right;
            width: 250px;
        }
    }
}

.player-details {
    line-height: 1.2em;
    font-size: 0.95em;
    letter-spacing: 0.4px;

    h4 {
        font-weight: 600;
    }

    span {
        font-weight: 600;
        font-size: 0.85em;
        vertical-align: middle;
        letter-spacing: 0.6px;
        opacity: 0.7;
        color: $colorAccent;
    }
}

.player-controls {
    display: flex;
    align-items: center;

    input {
        margin-left: 0.5em;
    }
}

@media screen and (max-width: 950px) {
    .playerbar-wrapper {
        height: 75px;
    }
}
@media screen and (max-width: 580px) {
    .playerbar-wrapper {
        height: 65px;
    }
    .player-controls {
        display: flex;
        align-items: center;

        input {
            display: none;
        }
    }
    .player-col {
        &:last-of-type {
            width: 90px !important;
        }
    }
    #buttonSpeaker {
        display: none;
    }
}

</style>
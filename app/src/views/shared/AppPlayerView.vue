<template>
    <div class="playerbar-wrapper">
        <div class="content-container playerbar-container">
            <div class="player-col player-details">
                <h6>{{ selectedChannel.title }}</h6>
                <h4>{{ selectedChannel.info.title }} <span> {{ selectedChannel.info.artist }}</span></h4>
            </div>
            <div class="player-col player-controls">
                <audio :id="audioElementID" :src="getStreamURL()" hidden autoplay @pause="eventPaused" @canPlay="eventCanPlay" @ended="eventEnded" @play="eventPlay"></audio>
                <button class="btn btn-icon btn-m btn-noscale" @click="toggle">
                    <transition name="animation_item_scale" mode="out-in">
                        <img src="@/assets/images/icons/pause.svg" v-if="!paused">
                        <img src="@/assets/images/icons/play.svg" v-else>
                    </transition>
                    <span class="loadingIndicator" v-if="loading"><v-lottie-player width="64px" height="64px" loop autoplay :animationData="loader"></v-lottie-player></span>
                </button>
                <button class="btn btn-icon btn-m btn-noscale">
                    <img src="@/assets/images/icons/speaker.svg">
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import loader from '@/assets/animated/primary_loader_light.json'
import config from '@/config/config.js'

export default {
    data() {
        return {
            loader,
            paused: false,
            loading: true,
            volume: 20,
            audioElementID: this.makeid(6)
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
        getStreamURL(){
            let path = this.selectedChannel.path
            let streamURL = config.api.streamBase + path.replace("/", "")+"?"+this.$store.state.jwt+"&"+this.$store.state.user.uuid;
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

            var delay = 50;
            
            setTimeout(() => {
                localStorage.setItem('tsr_volume_'+this.selectedChannel.uuid, val);
                element.volume = val/100;
            }, delay);
        },
        selectedChannel() {
            if(this.selectedChannel) {
                var volume = localStorage.getItem('tsr_volume_'+this.selectedChannel.uuid);
                if(volume) this.volume = volume;

                this.loading = true
            }
        }
    },
    computed: {
        selectedChannel() {
            return this.$store.state.currentChannel
        }
    },
    mounted(){
        this.changeSource(false)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

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
            text-align: right;
            width: 100px;
        }
    }
}

.player-details {
    h6 {
        color: $colorAccent;
        line-height: 2em;
        letter-spacing: 1px;
    }

    h4 {
        font-weight: 600;
        letter-spacing: 0;
        line-height: 1em;

        span {
            font-weight: 500;
            font-size: 0.7em;
            vertical-align: middle;
            letter-spacing: 0.3px;
            line-height: 1.5em;
            opacity: 0.3;
            margin-left: 0.5em;
        }
    }
}

@media screen and (max-width: 950px) {
    .playerbar-wrapper {
        height: 70px;
    }
}
@media screen and (max-width: 640px) {
    .playerbar-wrapper {
        height: 60px;
    }
}

</style>
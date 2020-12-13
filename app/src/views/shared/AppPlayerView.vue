<template>
    <div class="playerbar-wrapper">
        <div class="content-container playerbar-container">

            <transition name="animation_item_slide">
                <div class="voting-container layout-table table-nobreak" v-if="voting.active">
                    <div class="layout-col">
                        <h6>Abstimmung</h6>
                        <p>{{ voting.text }}</p>
                    </div>
                    <div class="layout-col">
                        <button :class="{'btn btn-circular btn-s btn-primary btn-icon': true, 'btn-success': voting.hasVoted }" @click="addVote"><img src="@/assets/images/icons/check.svg"></button>
                    </div>
                </div>
            </transition>

            <div class="player-col player-details">
                <h4 :id="itemID+'title'">{{ selectedChannel.info.title }} </h4>
                <span :id="itemID+'artist'">{{ selectedChannel.info.artist }}</span>
            </div>
            <div class="player-col" :id="itemID+'col'">
                <div class="player-controls">
                    <audio :id="audioElementID" :src="getStreamURL()" hidden autoplay @pause="eventPaused" @canPlay="eventCanPlay" @ended="eventEnded" @play="eventPlay" @error.prevent="eventError"></audio>
                    <button class="btn btn-icon btn-m btn-noscale" @click="toggle">
                        <transition name="animation_item_scale" mode="out-in">
                            <img src="@/assets/images/icons/pause.svg" v-if="!paused">
                            <img src="@/assets/images/icons/play.svg" v-else>
                        </transition>
                        <span class="loadingIndicator" v-if="loading"><v-lottie-player width="50px" height="50px" loop autoplay :animationData="loader"></v-lottie-player></span>
                    </button>
                    <button class="btn btn-icon btn-m btn-noscale" @click="addVote">
                        <span class="loadingIndicator" v-if="voting.isInitializing"><v-lottie-player width="50px" height="50px" loop autoplay :animationData="loader"></v-lottie-player></span>
                        <transition name="animation_item_scale" mode="out-in">
                            <img src="@/assets/images/icons/skip.svg" v-if="!voting.active">
                            <radial-progress-bar class="radial-progress-bar" v-else 
                                :diameter="32"
                                :completed-steps="voting.timeLeft"
                                :total-steps="voting.maxTime"
                                :strokeWidth="3"
                                :innerStrokeWidth="3"
                                :stopColor="'#FF4848'"
                                :startColor="'#fd6a6a'"
                                :isClockwise="false">

                                <span>{{ voting.timeLeft }}</span>

                            </radial-progress-bar>
                        </transition>
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
import socketjs from '@/models/socket.js'
import channeljs from '@/models/channel.js'
import loader from '@/assets/animated/primary_loader_light.json'
import config from '@/config/config.js'
import clamp from 'clamp-js'
import RadialProgressBar from 'vue-radial-progress'

export default {
    data() {
        return {
            loader,
            paused: false,
            loading: true,
            volume: 30,
            audioElementID: this.makeid(6),
            observer: undefined,
            itemID: this.makeid(6),
            voting: {
                active: false,
                isInitializing: false,
                hasVoted: false,
                maxTime: 30,
                timeLeft: 30,
                interval: undefined,
                text: "Lied überspringen?"
            }
        }
    },
    components: {
        RadialProgressBar
    },
    methods: {
        eventError() {
            this.paused = true
            this.loading = false
        },
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
        addVote(){
            if(this.voting.isInitializing || this.voting.hasVoted) return

            this.voting.isInitializing = true
            channeljs.initSkip(this.selectedChannel.uuid).then((result) => {
                console.log(result)
                
                if(result.status == 200) {
                    this.voting.active = true
                    this.voting.hasVoted = true
                } else {
                    this.voting.active = false
                    this.voting.hasVoted = false
                }
            }).finally(() => {
                this.voting.isInitializing = false
            })
        },
        setSocketRoom() {
            let channelRoom = "channel-"+this.selectedChannel.uuid
            socketjs.on("skip", async (data) => {
                let room = data.room

                if(room == channelRoom) {
                    console.log(data)
                    let status = data.status

                    if(status == 'init') {
                        if(this.voting.active){
                            this.endVote(false, true)
                        }

                        let createdAt = data.createdAt
                        let expiresAt = data.expiresAt
                        let currentTime = Date.now()

                        let timeOffset = currentTime-createdAt
                        let maxDurationSeconds = (expiresAt-createdAt-1000) / 1000
                        let timeLeftSeconds = ((expiresAt-createdAt-1000) - timeOffset) / 1000

                        this.voting.maxTime = Math.round(maxDurationSeconds)
                        this.voting.timeLeft = Math.round(timeLeftSeconds)

                        this.voting.interval = setInterval(() => {
                            this.voting.timeLeft -= 1
                        }, 1000)

                        this.voting.active = true

                        this.voting.timeout = setTimeout(() => {
                            this.endVote(false)
                        }, (timeLeftSeconds+1)*1000)
                    } else if(status == 'success') {
                        this.endVote(true)
                    } else if(status == 'failed'){
                        this.endVote(false)
                    }
                }
            })
        },
        endVote(success = false, force = false) {
            clearInterval(this.voting.interval)
            clearTimeout(this.voting.timeout)

            if(force) {
                this.resetVoting()
            } else {
                if(success){
                    this.voting.text = "Erfolgreich"
                } else {
                    this.voting.text = "Fehlgeschlagen"
                }

                setTimeout(() => {
                    this.resetVoting()
                }, 3000)
            }
        },
        resetVoting() {
            this.voting.active = false
            this.voting.isInitializing = false
            this.voting.hasVoted = false
            this.voting.text = "Lied überspringen?"
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

                this.voting = false
                this.setSocketRoom()
                this.resetVoting()
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
        this.setSocketRoom()
        this.resetVoting()
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

.radial-progress-bar {
    font-weight: 500;
}

.voting-container {
    position: absolute;
    top: -1em;
    transform: translateY(-100%);

    background-color: $colorPrimaryDark;
    padding: 0.5em;
    font-size: 0.85em;
    width: 300px;
    border: 2px solid $colorPlaceholder;
    border-radius: $borderRadTiny;
    box-shadow: $shadowHeavy;

    .layout-col {
        vertical-align: middle;

        h6 {
            font-weight: 600;
            letter-spacing: 0.5px;
            color: $colorAccent;
        }
        p {
            font-weight: 400;
            letter-spacing: 1px;
        }

        &:last-of-type {
            button {
                margin-left: 0.5em;
            }
            
            width: 70px;
            text-align: right;
        }
    }
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

.loadingIndicator {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
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

@media screen and (max-width: 340px) {
    .voting-container {
        width: 190px;
    }
}

</style>
<template>
    <footer class="player-wrapper" id="playerbar" @click="toggle">
        <div class="content-container">
            <transition name="anim_item_slide" mode="out-in">
                <div class="copyright" v-if="!showPlayer">
                    <p>&copy; {{ new Date().getFullYear() }} TSAlliance | All rights reserved</p>
                </div>

                <div class="layout-table" v-else>
                    <div class="layout-col">
                        <app-placeholder-image class="track-cover" :resourceId="channel?.uuid" :resourceType="'song'" :resourceKey="channel?.info?.cover"></app-placeholder-image>
                    </div>
                    <div class="layout-col">
                        <p>{{ channel?.info?.title }}</p>
                        <p>{{ channel?.info?.artist }}</p>
                    </div>
                    <div class="layout-col">
                        <div class="actions">
                            <div class="action-item">
                                <app-play-button :loading="player?.loading" v-model="player.paused"></app-play-button>
                            </div>

                            <!--<div :class="{'action-item': true, 'state-loading': player?.loadingVote}">
                                <app-loader class="loader voting-loader"></app-loader>
                                <button class="btn btn-icon btn-m"><img src="@/assets/icons/next.svg" alt=""></button>
                            </div>-->

                            <app-volume-slider :max="VOLUME_MAX" :min="0" :step="1" v-model="player.volume"></app-volume-slider>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <audio :id="audioElementId" hidden autoplay @pause="eventPaused" @canPlay="eventCanPlay" @ended="eventEnded" @play="eventPlay" @error.prevent="eventError"></audio>
    </footer>
</template>

<script>
import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'
import AppPlayButton from '@/components/button/AppPlayButtonComp.vue'
import AppVolumeSlider from '@/components/input/AppVolumeSlider.vue'

const VOLUME_MAX = 50
const VOLUME_DEFAULT = parseInt(VOLUME_MAX/2)

export default {
    components: {
        AppPlayButton,
        AppVolumeSlider,
        AppPlaceholderImage
    },
    data() {
        return {
            audioElementId: this.generateId(6),
            player: {
                paused: false,
                loading: true,
                volume: VOLUME_DEFAULT,
                loadingVote: false
            },
            VOLUME_MAX
        }
    },
    computed: {
        channel() {
            return this.$store.state.activeChannel
        },
        showPlayer() {
            return this.$store.state.activeChannel
        }
    },
    watch: {
        channel() {
            this.player.loading = true
            this.player.paused = false
            this.player.volume = parseInt(localStorage.getItem('tsr_volume_'+this.channel?.uuid)) || VOLUME_DEFAULT

            this.loadSource()
        },
        'channel.info'(info) {
            if("mediaSession" in navigator && this.channel && info) {
                const artworkUrl = this.$store.state.urls.coverBase + "/current/" + this.channel?.uuid;
                const album = "TSRadio :: " + this.channel.title;

                navigator.mediaSession.metadata = new window.MediaMetadata({
                    title: info.title,
                    artist: info.artist,
                    album,
                    artwork: [
                        { src: artworkUrl }
                    ]
                })
            }
        },
        'player.paused'(paused) {
            if(paused) {
                this.clearSource()
            } else {
                this.loadSource()
            }
        },
        'player.volume'(val) {
            this.setVolume(val)
        }
    },
    methods: {
        eventError(event) {
            this.player.paused = true
            this.player.loading = false

            if(event.target.error) {
                if(event.target.error.code == 3) {
                    setTimeout(() => {
                        this.player.paused = false
                    }, 100)
                } else {
                    if(event.target.error.code == 2) {
                        // MEDIA_ERR_NETWORK
                        this.$modal.showError("Es liegt ein Problem mit deinem Internetzugang vor. Der Stream konnte daher nicht geladen werden. Bitte versuche es später erneut.")
                    }

                    if(event.target.error.code != 4) {
                        this.$notification.error("audio-error", "Beim Abspielen des Streams ist ein Fehler aufgetreten. Bitte versuche den Stream neuzustarten.")
                    }
                }
            }
        },
        eventPaused() {
            this.player.paused = true
            this.player.loading = false
            this.clearSource()
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
            this.clearSource()
        },
        getStreamUrl(){
            if(!this.channel?.mountpoint) return "/"
            return this.$store.state.urls.streamBase + this.channel?.mountpoint + "?token=" + this.$store.state.account.session + "&channel=" + this.channel?.uuid
        },
        clearSource() {
            let element = document.getElementById(this.audioElementId)
            if(!element) return

            element.setAttribute('src', '')
        },
        loadSource(){
            let element = document.getElementById(this.audioElementId)
            if(!element) return

            this.player.loading = true
            element.setAttribute('src', this.getStreamUrl())
            element.load()
            element.volume = this.player.volume / 100
        },
        setVolume(value) {
            if(value == undefined || value == null) return

            let element = document.getElementById(this.audioElementId)
            if(!element) return

            element.volume = parseInt(value) / 100
            localStorage.setItem('tsr_volume_'+this.channel?.uuid, value)
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.copyright {
    text-align: center;
}

.player-wrapper {
    position: absolute;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
    bottom: 0;
    height: $playerHeight;
    width: 100%;
    background-color: $colorPrimary;
    z-index: 10000;
    transition: all $animSpeedNormal*1s $cubicNorm;

    border-top: 2px solid $colorPlaceholder;
    box-shadow: $shadowHeavy;

    .layout-table {
        padding: 1em 0;

        .layout-col {
            vertical-align: middle;

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

</style>
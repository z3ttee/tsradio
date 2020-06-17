<template>
    <transition name="slide">
        <div class="tsr_playerbar_wrapper" v-if="Object.keys(channel).length != 0">
            <div class="content-container">
                <div>
                    <div class="tsr_actionbox playerbar_channelbox large">
                        Du hörst <span v-html="channel.name"></span>
                    </div>
                    <div class="tsr_actionbox playerbar_channelbox" @click="upvote"><img src="/assets/images/icons/like.svg"></div>
                    <div class="tsr_actionbox playerbar_channelbox" @click="$router.push({ path: '/channels/'+channel.id })">Mehr anzeigen</div>
                </div>
            </div>
            
            <div class="tsr_playerbar">
                <div class="content-container">
                    <div class="player_col playerbar_cover" :style="'background-image: url('+channel.coverURL+')'" @click="toggle">
                        <transition name="scale" mode="out-in">
                            <lottie-player id="audioLoader" class="loader" :src="loaderData" :options="{ autoplay: true, loop: true }" v-if="loading"></lottie-player>
                        </transition>
                        <transition name="scale" mode="out-in">
                            <img src="/assets/images/icons/play.svg" v-if="paused" key="play">
                            <img src="/assets/images/icons/pause.svg" v-else key="pause">
                        </transition>
                    </div>
                    
                    <!--<transition name="infoSlide" mode="out-in">-->
                        <div id="div" class="player_col playerbar_info" v-if="channel.info" :key="Math.floor(Math.random() * 100)">
                            <p id="p" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'+ channel.info.title"></p>
                            <p v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.artist"></p>
                        </div>
                    <!--</transition>-->
                    
                    <div class="player_col playerbar_controls">
                        <img src="/assets/images/icons/speaker.svg">
                        <input class="tsr_slider hidden" type="range" max="100" min="0" v-model="volume">
                    </div>
                    <audio id="audiosrc" 
                        hidden 
                        src="" 
                        :paused="paused" 
                        autoplay 
                        @canplay="eventCanPlay"
                        @ended="eventEnded"></audio>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
//import $ from 'jquery';
import Loader from '@/assets/animated/loader.json';

export default {
    data() {
        return {
            volume: 10,
            paused: true,
            loaderData: Loader,
            loading: false
        }
    },
    computed: {
        channel() {
            return this.$store.state.currentChannel;
        }
    },
    watch: {
        volume(val) {
            var audioSrc = document.getElementById('audiosrc');
            var delay = audioSrc == null ? 50 : 0;
            
            setTimeout(() => {
                localStorage.setItem('tsr_volume_'+this.channel.id, val);
                document.getElementById('audiosrc').volume = val/100;
            }, delay);
        },
        channel(val) {
            var volume = localStorage.getItem('tsr_volume_'+this.channel.id);
            if(volume) this.volume = volume;

            this.changeSource(val.mountpoint);
        }
    },
    methods: {
        changeSource(mountpoint) {
            setTimeout(() => {
                var audioElement = document.getElementById('audiosrc');

                if(mountpoint === ''){
                    this.loading = false;
                    audioElement.setAttribute('src', '');
                    return;
                }

                if(mountpoint == null) {
                    mountpoint = this.channel.mountpoint;
                }
                
                var streamURL = 'https://streams.tsradio.live' + mountpoint;

                if(audioElement.src != streamURL) {
                    this.paused = false;
                    this.loading = true;
                    
                    audioElement.volume = this.volume/100;
                    
                    audioElement.setAttribute('src', streamURL);
                    audioElement.load();
                }
            }, 50);
        },
        toggle() {
            this.paused == true ? this.paused = false : this.paused = true;

            if(!this.paused) {
                this.changeSource(null);
            } else {
                this.changeSource('');
            }
        },
        upvote() {

        },
        eventEnded(){
            this.changeSource(null);
        },
        eventCanPlay(event) {
            this.loading = false;
            event.target.play();
        }
    },
    mounted() {
        var element = document.getElementById('div');

        if(element) {
            var height = (element.clientHeight + 1) + "px";
            var width = (element.clientWidth + 1) + "px"
            console.log(height, width);
        }

        if(element) {
            element = document.getElementById('p');
            height = (element.clientHeight + 1) + "px";
            width = (element.clientWidth + 1) + "px"
            console.log(height, width);
        }

        //console.log($('#div')[0].scrollWidth, $('#div').innerWidth());
    }
}
</script>

<style lang="scss" scoped>
    .tsr_slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        background: $colorPlaceholder;
        outline: none;

        &:hover {
            opacity: 1;
            cursor: pointer;

            &::-webkit-slider-thumb,&::-moz-range-thumb {
                transform: scale(1.15);
            }
        }

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            background: $colorAccent;
            border: 4px solid $colorPrimary;
            border-radius: 50%;
            transition: all $animSpeedFast*1s $cubicNormal;
        }
        &::-moz-range-thumb {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 4px solid $colorPrimary;
            background: $colorAccent;
            transition: all $animSpeedFast*1s $cubicNormal;
        }
    }

    .tsr_playerbar_wrapper {
        position: fixed;
        z-index: 1000000000;
        width: 100%;
        bottom: 0;
        color: $colorWhite;

        .content-container {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .playerbar_channelbox {
            margin: auto;
            font-size: 0.65em;
            margin: 1.5em 0.5em;

            span {
                color: $colorAccent;
                font-weight: inherit;
            }

            img {
                height: 14px;
                vertical-align: middle;
                margin-right: 0.3em;
            }

            &:hover {
                cursor: pointer;
            }
        }

        .tsr_playerbar {
            padding: 1em 0em;
            background-color: $colorPrimary;
            box-shadow: $shadowNormal;

            .content-container {
                display: table;
                table-layout: fixed;
            }

            .player_col {
                display: table-cell;
                max-width: 33%;
                vertical-align: middle;
            }

            .playerbar_cover {
                position: relative;
                height: 64px;
                width: 64px;

                border-radius: $borderRadSmall;

                background-position: center;
                background-size: cover;
                background-color: $colorPlaceholder;
                box-shadow: $shadowNormal;

                text-align: center;

                &:hover {
                    cursor: pointer;
                }

                img {
                    pointer-events: none;
                    width: 20px;
                    height: 20px;
                    vertical-align: middle;
                }
            }

            .playerbar_info {
                position: relative;
                overflow: hidden;

                &::before, &::after {
                    display: inline-block;
                    width: 1.5em;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    background-image: linear-gradient(-90deg, rgba($colorPrimary, 0) 0%, rgba($colorPrimary, 1) 100%);
                    z-index: 1000;
                    content: "";
                }
                &::before {
                    left: 0;
                }
                &::after {
                    right: 0;
                    content: "";
                    background-image: linear-gradient(90deg, rgba($colorPrimary, 0) 0%, rgba($colorPrimary, 1) 100%);
                }

                p {
                    white-space: nowrap;
                    text-overflow: clip;
                    font-weight: 800;
                    line-height: initial;
                    margin: 0em;
                    color: $colorWhite;

                    &:first-of-type {
                        font-size: 1.3em;
                    }
                    &:last-of-type {
                        opacity: 0.7;
                        font-family: 'BebasKai';
                        letter-spacing: 1px;
                        font-weight: 400;
                    }
                }
            }

            .playerbar_controls {
                padding-left: 1em;
                width: 160px;
                text-align: center;

                img {
                    height: 24px;
                    width: 24px;
                    vertical-align: middle;
                }
                input {
                    margin-left: 1em;
                    display: inline-block;
                    width: 80px;
                    vertical-align: middle;
                }
            }
        }
    }

    .loader {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .scale-enter-active {
        animation: scale-in $animSpeedShort*1s ease-out forwards;
    }
    .scale-leave-active {
        animation: scale-out $animSpeedShort*1s ease-out forwards;
    }
    .slide-enter-active {
        animation: slide-in-up $animSpeedMedium*1s $cubicNormal forwards;
    }
    .slide-leave-active {
        animation: slide-out-down $animSpeedMedium*1s $cubicNormal forwards;
    }

    .infoSlide-enter-active {
        animation: InfoSlideIn $animSpeedMedium*1s $cubicNormal forwards;
    }
    .infoSlide-leave-active {
        animation: InfoSlideOut $animSpeedMedium*1s $cubicNormal forwards;
    }

    /*
    Scale In
    */
    @keyframes scale-in {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    @keyframes scale-out {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }

    /*
    Slide In Up
    */
    @keyframes slide-in-up {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slide-out-down {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }

    /*
    InfoSlide
    */
    @keyframes InfoSlideIn {
        from {
            transform: translateY(0.1em);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes InfoSlideOut {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-0.1em);
            opacity: 0;
        }
    }
</style>
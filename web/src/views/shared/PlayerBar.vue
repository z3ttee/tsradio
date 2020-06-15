<template>
    <transition name="slide">
        <div class="tsr_playerbar_wrapper" v-if="currentChannel">
            <div class="content-container">
                <div>
                    <div class="tsr_actionbox playerbar_channelbox large">Du hörst gerade <span v-html="currentChannel.name"></span></div>
                    <div class="tsr_actionbox playerbar_channelbox" @click="upvote"><img src="/assets/images/icons/like.svg"> Upvote</div>
                </div>
            </div>
            
            <div class="tsr_playerbar">
                <div class="content-container">
                    <div class="player_col playerbar_cover" :style="'background-image: url('+currentChannel.coverURL+')'" @click="toggle">
                        <transition name="scale" mode="out-in">
                            <img src="/assets/images/icons/play.svg" v-if="paused" key="play">
                            <img src="/assets/images/icons/pause.svg" v-else key="pause">
                        </transition>
                    </div>
                    <div id="div" class="player_col playerbar_info" v-if="currentChannel.info">
                        <p id="p" v-if="currentChannel.info.title"><marquee>{{ currentChannel.info.title }}</marquee></p>
                        <p v-if="currentChannel.info.artist">{{ currentChannel.info.artist }}</p>
                    </div>
                    <div class="player_col playerbar_controls">
                        <img src="/assets/images/icons/speaker.svg" >
                        <input class="tsr_slider hidden" type="range" name="" id="" max="100" min="0" v-model="volume">
                    </div>
                    <audio id="audiosrc" hidden :src="''" :paused="paused" autoplay></audio>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
//import $ from 'jquery';

export default {
    props: ['currentChannel'],
    data() {
        return {
            volume: 0,
            paused: true
        }
    },
    watch: {
        volume(val) {
            document.getElementById('audiosrc').volume = val/100;
            console.log(val/100);
        },
        paused() {
            
        }
    },
    methods: {
        toggle() {
            this.paused == true ? this.paused = false : this.paused = true;
        },
        stop() {
            this.paused = true;
        },
        upvote() {

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
    .tsr_playerbar_wrapper {
        position: fixed;
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
                    width: 24px;
                    height: 24px;
                    vertical-align: middle;
                }
            }

            .playerbar_info {
                position: relative;
                //border: 1px solid red;
                //padding-left: 1em;
                //padding-right: 1em;
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
                    text-overflow: ellipsis;
                    font-weight: 800;

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

    .scale-enter-active {
        animation: scale-in $animSpeedShort*1s ease-out forwards;
    }
    .scale-leave-active {
        animation: scale-out $animSpeedShort*1s ease-out forwards;
    }
    .slide-enter-active {
        animation: slide-in-up $animSpeedMedium*1s cubic-bezier(.43,.01,.32,1) forwards;
    }
    .slide-leave-active {
        animation: slide-out-down $animSpeedMedium*1s cubic-bezier(.43,.01,.32,1) forwards;
    }

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
</style>
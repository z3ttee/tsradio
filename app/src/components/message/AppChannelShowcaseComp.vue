<template>
    <div :class="{'showcase-wrapper': true, 'selected': isSelected}" :id="itemID+'content'" @click="select">
        <div class="background-overlay" :id="itemID+'background'">dev</div>
        <div class="showcase-container">
            <h4>
                <slot name="title"></slot>
            </h4>

            <span class="playingIndicator"><v-lottie-player width="20px" height="20px" loop autoplay :animationData="playingIndicatorData" v-if="isSelected"></v-lottie-player></span>
            <span class="listener-details">{{ channel.listeners }}<img class="tiny" src="@/assets/images/icons/headphone.svg"></span>

            <div class="showcase-description" v-if="channel">
                <div class="layout-table table-nobreak">
                    <div class="layout-col" :id="itemID+'cover'"></div>
                    <div class="layout-col">
                        <h2>{{ channel.title }}</h2>

                        <div class="showcase-track-details">
                            <p class="info-title" :id="itemID+'title'">{{ channel.info.title }}</p>
                            <p class="info-artist" :id="itemID+'artist'">{{ channel.info.artist }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import config from '@/config/config.js'
import clamp from 'clamp-js'
import playingIndicatorData from '@/assets/animated/audio.json'

export default {
    props: {
        channel: Object,
        default: {}
    },
    data() {
        return {
            itemID: this.makeid(6),
            playingIndicatorData
        }
    },
    watch: {
        'channel.info'() {
            this.updateCoverImage()
        }
    },
    computed: {
        isSelected() {
            return this.$store.state.currentChannel && this.$store.state.currentChannel.uuid == this.channel.uuid
        }
    },
    methods: {
        select() {
            if(!this.isSelected) {
                this.$store.state.currentChannel = this.channel
                this.$router.push({name: 'channelDetails', params: {id: this.channel.uuid}})
            }
        },
        updateCoverImage(){
            let containerElement = document.getElementById(this.itemID+'background')
            let coverElement = document.getElementById(this.itemID+'cover')
            let coverURL = config.api.baseURL+'artworks/'+this.channel.uuid+'.png?key='+this.makeid(4)
            
            coverElement.style.backgroundImage = "url('"+coverURL+"')"
            containerElement.style.backgroundImage = "url('"+coverURL+"')"
        }
    },
    mounted() {
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

        this.observer.observe(document.getElementById(this.itemID+'content'))
        this.updateCoverImage()
    },
    unmounted() {
        try {
            this.observer.unobserve(document.getElementById(this.itemID+'content'))
        } catch (error) { /* Do nothing */ }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.layout-col {
    vertical-align: middle;

    &:first-of-type {
        width: 128px;
        height: 128px;

        border-radius: $borderRadSmall;
        box-shadow: $shadowHeavy;

        background: url("/assets/images/branding/ts_logo_padding.png"), $colorPlaceholder;
        background-size: cover;
        background-position: center;

        overflow: hidden;
    }
    &:last-of-type {
        padding-left: 1em;
    }
}

.background-overlay {
    position: absolute;
    
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    filter: blur(8px);
    z-index: 0;
    background-position: center;
    background-size: cover;
}

h2 {
    font-weight: 700;

    background: linear-gradient($colorAccent, $colorPrimary 130%);
    background-clip: text;
    -webkit-text-fill-color: transparent;

    text-shadow: 1px 1px 0px rgba($color: $colorPrimaryDarker, $alpha: 0.1);
}

.showcase-wrapper {
    cursor: pointer;
    position: relative;
    display: block;
    width: 100%;
    padding-top: 30%;

    background: $gradientBox;
    box-shadow: $shadowNormal;
    
    border: 3px solid $colorPrimary;
    border-radius: $borderRadSmall;
    overflow: hidden;
    margin-bottom: 3em;
    transition: all $animSpeedFast*1s $cubicNorm;

    &.selected {
        border-color: $colorPlaceholder;
    }
}

.showcase-container {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    background: none;
    top: 0;
    left: 0;
    padding: 1em;
    background-color: rgba($color: $colorPrimaryDark, $alpha: 0.92);
    background: linear-gradient(180deg, rgba($color: $colorPrimary, $alpha: 1.0) 0%, rgba($color: $colorPrimary, $alpha: 0.8) 50%, rgba($color: $colorPrimary, $alpha: 1.0) 100%);

    .showcase-description {
        padding: 1.5em;
        position: absolute;
        display: table;
        width: 100%;
        bottom: 0;
        left: 0;

        .info-title {
            font-weight: 600;
            letter-spacing: 0;
            font-size: 1em;
        }
        .info-artist {
            font-weight: 400;
            font-size: 0.7em;
            letter-spacing: 0.3px;
            line-height: 1.5em;
            opacity: 0.5;
        }
    }
}

.listener-details {
    margin: 0;
    padding: 0;
    position: absolute;
    bottom: 0;
    right: 0.5em;
    font-size: 0.85em;
    font-weight: 500;
    color: $colorAccent;
    opacity: 0.6;

    img {
        height: 12px;
        margin-left: 0.5em;
        vertical-align: middle;
        margin-top: -0.25em;
    }
}

.playingIndicator {
    position: absolute;
    top: 1em;
    right: 0.5em;
}

@media screen and (max-width: 1300px) {
    .layout-col {
        &:first-of-type {
            width: 100px;
            height: 100px;
        }
    }

    h2 {
        font-size: 1.5em;
    }
}

@media screen and (max-width: 950px) {
    .showcase-wrapper {
        padding-top: 35%;
    }
    .layout-col {
        &:first-of-type {
            width: 70px;
            height: 70px;
        }
    }

    h2 {
        font-size: 1.2em;
    }
}
@media screen and (max-width: 580px) {
    .showcase-wrapper {
        padding-top: 35%;
    }

    h2 {
        font-size: 1em;
    }
    p.info-title {
        font-size: 0.5em;
    }
    p.info-artist {
        font-size: 0.7em;
    }
}
@media screen and (max-width: 500px) {
    .showcase-wrapper {
        padding-top: 40%;
    }
    .layout-col {
        &:first-of-type {
            width: 64px;
            height: 64px;
        }
    }
}
@media screen and (max-width: 430px) {
    .showcase-wrapper {
        padding-top: 45%;
    }
}
@media screen and (max-width: 380px) {
    .showcase-wrapper {
        padding-top: 45%;
    }
    .layout-col {
        &:first-of-type {
            width: 50px;
            height: 50px;
        }
    }
}
@media screen and (max-width: 340px) {
    .playingIndicator {
        top: 3.5em;
        left: 1em;
        right: initial;
    }
}
@media screen and (max-width: 340px) {
    .showcase-wrapper {
        padding-top: 55%;
    }
}
</style>
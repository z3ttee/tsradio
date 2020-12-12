<template>
    <div class="list-item-covered-wrapper">
        <div :id="itemID+'content'" :class="{'list-item-covered': true, 'selected': isSelected}" @click="select">
            <transition name="animation_item_slide">
                <span class="playingIndicator"><v-lottie-player width="20px" height="20px" loop autoplay :animationData="playingIndicatorData" v-if="isSelected"></v-lottie-player></span>
            </transition>

            <div :id="itemID+'cover'" class="list-item-col list-item-cover"></div>
            <div :id="itemID+'info'" class="list-item-col list-item-content channel-info">
                <h4 :id="itemID+'title'">{{ channel.title }}</h4>
                <div>
                    <transition name="animation_item_slide" mode="out-in">
                        <p :id="itemID+'song'" :key="itemID+'song'" class="info-title"><span v-if="channel.info">{{ channel.info.title }}</span></p>
                    </transition>
                     <transition name="animation_item_slide" mode="out-in">
                        <span :id="itemID+'artist'" :key="itemID+'artist'" class="info-artist"><span v-if="channel.info">{{ channel.info.artist }}</span></span>
                    </transition>
                </div>
                <span class="listener-details">{{ channel.listeners }}<img class="tiny" src="@/assets/images/icons/headphone.svg"></span>
            </div>
        </div>
    </div>
</template>

<script>
import channeljs from '@/models/channel.js'
import socketjs from '@/models/socket.js'
import config from '@/config/config.js'
import clamp from 'clamp-js'
import playingIndicatorData from '@/assets/animated/audio.json'

export default {
    props: {
        channel: Object
    },
    data() {
        return {
            itemID: this.makeid(6),
            observer: undefined,
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
                let previous = this.$store.state.currentChannel
                let next = this.channel

                if(previous) socketjs.off(socketjs.CHANNEL_SKIP+previous.uuid)
                this.$store.state.currentChannel = this.channel
                socketjs.on(socketjs.CHANNEL_SKIP+next.uuid, (data) => channeljs.onChannelSkipListener(data))
            }
        },
        updateCoverImage(){
            let coverElement = document.getElementById(this.itemID+'cover')
            let coverURL = config.api.baseURL+'artworks/'+this.channel.uuid+'.png?key='+this.makeid(4)
            
            coverElement.style.backgroundImage = "url('"+coverURL+"')"
        }
    },
    mounted() {
        this.observer = new ResizeObserver(() => {
            try {
                clamp(document.getElementById(this.itemID+'song'), {clamp: 0, useNativeClamp: true, animate: true})
                clamp(document.getElementById(this.itemID+'song'), {clamp: 1, useNativeClamp: true, animate: true})
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
@import '@/assets/scss/lists.scss';

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
    top: 0.4em;
    right: 0.5em;
}

.channel-info {
    h4,div {
        font-size: 1.2em;
        
        letter-spacing: 0.4px;
        line-height: 1.2em;
        height: 58px;
    }

    h4 {
        display: block;
        padding-top: 0.5em;
        margin: 0;
        line-height: 1.5em;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: $colorAccent;

        background: linear-gradient($colorAccent, $colorPrimary);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    div {
        color: $colorWhite;

        p.info-title {
            font-weight: 600;
            letter-spacing: 0;
        }

        span.info-artist {
            display: block;
            font-weight: 400;
            font-size: 0.7em;
            letter-spacing: 0.3px;
            line-height: 1.5em;
            opacity: 0.5;
        }
    }
}

@media screen and (max-width: 1300px) {
    .channel-info {
        h4,div {
            font-size: 1.2em;
            height: 48px;
        }
    }
}
@media screen and (max-width: 950px) {
    .channel-info {
        h4,div {
            font-size: 1.35em;
            height: 40px;
        }
    }
}
</style>
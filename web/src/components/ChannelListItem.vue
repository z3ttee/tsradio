<template>
    <div class="tsr_list_item_wrapper">
        <div :class="'tsr_list_item item_inline '+(currentChannel.id == channel.id ? 'active' : '')" @click="select">
            <lottie-player class="animation" :src="AudioAnimation" :options="{ autoplay: true, loop: true }" v-if="currentChannel.id == channel.id"></lottie-player>

            <div class="tsr_list_item_col">
                <div class="tsr_list_cover" :style="'background-image: url(\''+channel.coverURL+'\');'"></div>
            </div>
            <div class="tsr_list_item_col tsr_list_item_content">
                <p class="name" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.name"></p>
                <div class="tsr_info">
                    <p class="title" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.title"></p>
                    <p class="artist" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.artist"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AudioAnimation from '@/assets/animated/audio.json';

export default {
    props: ['channel'],
    data() {
        return {
            AudioAnimation
        }
    },
    computed: {
        currentChannel() {
            return this.$store.state.currentChannel;
        }
    },
    methods: {
        select(){
            if(this.currentChannel.id == this.channel.id) {
                this.$router.push({ path: '/channels/'+this.channel.id });
            } else {
                this.$store.state.currentChannel = this.channel;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_list_item_wrapper {
        position: relative;
    }

    .animation {
        position: absolute;
        top: 1em;
        right: 1em;
        z-index: 10001;
        width: 24px;
    }

    .tsr_list_item {
        $height: 100px;

        display: table;
        table-layout: fixed;

        margin: 0.5em 0em;
        width: 100%;

        background-color: $colorPrimary;
        box-shadow: $shadowNormal;
        border-radius: $borderRadMedium;
        overflow: hidden;
        transition: all $animSpeedFast*1s $cubicNormal;
        border: 2px solid transparent;

        &.active {
            border-color: $colorPlaceholder;
        }

        &:hover {
            cursor: pointer;
        }

        &:active {
            transform: scale(0.98);
        }

        .tsr_list_item_col {
            display: table-cell;
            width: 100%;
            overflow: hidden;
            vertical-align: middle;

            &:first-of-type {
                width: $height;
                height: $height;
            }
        }

        .tsr_list_cover {
            width: $height;
            height: $height;
            border-radius: $borderRadMedium;
            box-shadow: $shadowSpread;
            background-color: $colorPlaceholder;
            background-size: cover;
            background-position: center;
        }

        .tsr_list_item_content {
            position: relative;
            overflow: hidden;

            &::before, &::after {
                display: inline-block;
                width: 2em;
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
                width: 4em;
                content: "";
                background-image: linear-gradient(90deg, rgba($colorPrimary, 0) 0%, rgba($colorPrimary, 1) 50%);
            }
        }
    }

    p {
        line-height: initial;
        margin: initial;
        font-size: 1.2em;
        color: $colorWhite;

        white-space: nowrap;
        text-overflow: clip;

        &.name {
            color: $colorAccent;
            margin-bottom: 0.15em;
        }
        &.title {
            font-weight: 800;
        }
        &.artist {
            font-family: 'BebasKai';
            font-weight: 400;
            letter-spacing: 1.5px;
            opacity: 0.7;
            font-size: 1em;
        }
    }
</style>
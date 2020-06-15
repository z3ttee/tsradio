<template>
    <div>
        <tsr-header></tsr-header>
        <div style="padding-top: 10em"></div>
        <tsr-playerbar :currentChannel="currentChannel"></tsr-playerbar>
        <transition name="backPage" mode="out-in">
            <router-view @channelToggled="channelToggled"></router-view>
        </transition>
    </div>
</template>

<script>
import Header from '../shared/Header.vue';
import PlayerBar from '../shared/PlayerBar.vue';

export default {
    components: {
        tsrHeader: Header,
        tsrPlayerbar: PlayerBar
    },
    data(){
        return {
            currentChannel: null
        }
    },
    methods: {
        channelToggled(){
            this.currentChannel == null ? this.currentChannel = {coverURL: '', streamURL: 'https://streams.tsradio.live/dance', name: 'Wipfrawelle', info: {title: 'Das ist ein Titel', artist: 'Das ist ein Artist'}} : this.currentChannel = null;
            console.log('consumed');
        }
    }
}
</script>

<style lang="scss" scoped>
    .backPage-enter-active {
        animation: backInUp 0.5s $cubicNormal forwards;
    }
    .backPage-leave-active {
        animation: backOutDown 0.5s $cubicNormal forwards;
    }

    @keyframes backInUp {
        0% {
            opacity: 0;
            transform: scale(0.98) translateY(2em);
        }
        50% {
            opacity: 1;
            transform: scale(0.98) translateY(0);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    @keyframes backOutDown {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        50% {
            opacity: 1;
            transform: scale(0.98) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0.98) translateY(2em);
        }
    }
</style>
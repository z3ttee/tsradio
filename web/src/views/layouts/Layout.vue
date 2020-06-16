<template>
    <div id="wrapper" :class="$store.state.theme">
        <tsr-header></tsr-header>
        <div style="padding-top: 10em"></div>
        <tsr-playerbar></tsr-playerbar>
        <transition name="backPage" mode="out-in">
            <router-view @channelsReceived="channelsReceived"></router-view>
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
            channels: []
        }
    },
    methods: {
        channelsReceived(channels){
            for(var channel of channels) {
                if(this.currentChannel && channel.id == this.currentChannel.id) {
                    this.currentChannel = channel;
                    break
                }
            }
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
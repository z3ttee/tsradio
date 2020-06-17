<template>
    <div id="wrapper" :class="$store.state.theme">
        <tsr-header @openSidebar="openSidebar"></tsr-header>
        <div style="padding-top: 10em"></div>
        <transition name="backPage" mode="out-in">
            <router-view @channelsReceived="channelsReceived"></router-view>
        </transition>
        <div style="height: 10em;"></div>
    </div>
</template>

<script>
import Header from '../shared/Header.vue';


export default {
    components: {
        tsrHeader: Header
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
        },
        openSidebar() {
            console.log('TODO: Open sidebar');
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
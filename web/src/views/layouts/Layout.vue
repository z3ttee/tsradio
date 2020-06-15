<template>
    <div>
        <tsr-header></tsr-header>
        <div style="padding-top: 10em"></div>
        <tsr-playerbar :currentChannel="currentChannel"></tsr-playerbar>
        <router-view @channelToggled="channelToggled"></router-view>
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
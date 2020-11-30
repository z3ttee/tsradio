<template>
    <div class="tsr-player" v-if="$store.state.currentChannel">
        <h6>Du hörst {{ $store.state.currentChannel.title }}</h6>
        <audio id="audiosrc" src="''" autoplay controls></audio>
    </div>
</template>

<script>
import config from '@/config/config.js'

export default {
    data() {
        return {
            source: ''
        }
    },
    watch: {
        '$store.state.currentChannel'(val){
            this.source = config.api.streamsBase + val.path.slice(1)
            this.changeSource()
        }
    },
    methods: {
        changeSource(){
            setTimeout(() => {
                let audioElement = document.getElementById('audiosrc');

                if(audioElement) {
                    audioElement.volume = 0.1;
                        
                    audioElement.setAttribute('src', this.source);
                    audioElement.load();
                }
            }, 500)
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.tsr-player {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    padding: $windowPad/1.5;
    background: $gradientBox;
    box-shadow: $shadowNormal;
}
</style>
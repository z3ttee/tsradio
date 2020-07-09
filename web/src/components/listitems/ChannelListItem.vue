<template>
    <div class="tsr_list_item_wrapper" @contextmenu.prevent="openContextMenu">
        <div :class="'tsr_list_item '+(currentChannel.id == channel.id ? 'active' : '')" @click="select">
            <lottie-player class="animation" :src="AudioAnimation" :options="{ autoplay: true, loop: true }" v-if="currentChannel.id == channel.id"></lottie-player>

            <div class="tsr_list_item_col">
                <div class="tsr_list_cover" :style="'background-image: url(\''+channel.coverURL+'\');'"></div>
            </div>
            <div class="tsr_list_item_col tsr_list_item_content">
                <p class="name" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.name"></p>
                <div class="tsr_info">
                    <p class="title" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.title" v-if="channel.info"></p>
                    <p class="artist" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.artist" v-if="channel.info"></p>
                </div>
            </div>
        </div>
   </div>
</template>

<script>
import { contextMenuMixin } from '@/mixins/contextmenu.js';
import AudioAnimation from '@/assets/animated/audio.json';

export default {
    mixins: [contextMenuMixin],
    props: ['channel', 'clickDisabled'],
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
            if(this.currentChannel.id == this.channel.id && !this.clickDisabled) {
                this.$router.push({ path: '/channels/'+this.channel.id });
            } else {
                this.$store.state.currentChannel = this.channel;
            }
        }
    }
}
</script>
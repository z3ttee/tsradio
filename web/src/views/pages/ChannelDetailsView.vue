<template>
    <div class="content-container">
        <h1><span>Du hörst gerade</span> {{ selectedChannel.name }}</h1>
        <!--<hr class="interface large">-->
        
        <br><br>
        <h4>Jetzt läuft</h4>
        <channel-list-item :key="selectedChannel.id" :channel="selectedChannel" :clickDisabled="true"></channel-list-item>
        <div class="tsr_listeners">
            <img src="/assets/images/icons/listen.svg">
            <span>{{ selectedChannel.listenerCount-1 }}</span> weiter{{ selectedChannel.listenerCount-1 == 0 ? 'e' : 'er' }} Zuhörer
        </div>
        <hr class="interface large">
        <div>
            <h4>Bereits gespielt</h4>
            <br>
            <transition-group name="slide" tag="div" class="tsr_layout_tablelist" appear>
                <track-list-item v-for="time in sorted" :key="time" :track="getTrack(time)" :time="time" :channel="selectedChannel"></track-list-item>
            </transition-group>
        </div>
    </div>
</template>

<script>
import Channels from '@/models/channels.js';
import ChannelListItem from '@/components/listitems/ChannelListItem.vue';
import TrackListItem from '@/components/listitems/TrackListItem.vue';

export default {
    components: {
        ChannelListItem,
        TrackListItem
    },
    computed: {
        selectedChannel() {
            return Channels.getChannelByID(this.$route.params.id);
        },
        history() {
            return this.selectedChannel.info.history
        },
        sorted() {
            return Object.keys(this.history).sort((a, b) => { return b-a });
        }
    },
    methods: {
        getTrack(time) {
            return this.history[time];
        }
    }
}
</script>

<style lang="scss" scoped>
    h1 {
        span {
            display: block;
            font-family: 'BebasKai';
            font-size: 0.5em;
            font-weight: 400;
            letter-spacing: 1px;
            color: $colorAccent;
        }
    }

    .tsr_listeners {
        text-align: right;
        font-weight: 300;

        img {
            height: 20px;
            width: 20px;
            vertical-align: middle;
            opacity: 0.8;
        }

        span {
            color: $colorAccent;
            font-weight: 800;
            padding-left: 0.5em;
            padding-right: 0.5em;
        }
    }
</style>
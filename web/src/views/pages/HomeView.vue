<template>
    <div>
        <section id="featured">
            <div class="content-container">
                <h2>Featured</h2>
                <div class="tsr_list">
                    <transition-group name="slide" appear>
                        <channel-list-item v-for="channel in featuredChannels" :key="channel.id" :channel="channel"></channel-list-item>
                    </transition-group>
                </div>
            </div>
        </section>
        <section id="other">
            <div class="content-container">
                <h2>Weitere Channel</h2>
                <transition-group name="slide" appear>
                    <channel-list-item v-for="channel in otherChannels" :key="channel.id" :channel="channel" @selected="selected(channel)"></channel-list-item>
                </transition-group>
            </div>
        </section>
        <!--<section id="inactive">
            <div class="content-container">
                <h2>Inaktive Channel</h2>
                <transition-group name="slide" appear>
                    <channel-list-item v-for="channel in inactiveChannels" :key="channel.id" :channel="channel" @selected="selected(channel)"></channel-list-item>
                </transition-group>
            </div>
        </section>-->
    </div>
</template>

<script>
import ChannelListItem from '../../components/ChannelListItem.vue';

export default {
    data() {
        return {
            channels: [],
        }
    },
    components: {
        ChannelListItem
    },
    computed: {
        featuredChannels() {
            return this.channels.filter((element) => {
                if(!!+element.featured && !!+element.listed && element.isActive) return element;
            });
        },
        otherChannels() {
            return this.channels.filter((element) => {
                if(!+element.featured && !!+element.listed && element.isActive) return element;
            });
        },
        inactiveChannels() {
            return this.channels.filter((element) => {
                if(!!+element.listed && !element.isActive) return element;
            });
        }
    },
    methods: {
        channelRequestFailure(error){
            console.log(error);
        },
        channelRequestSuccess(data){
            var channelList = [];

            for(var id in data.payload) {
                var channel = data.payload[id];
                channelList.push(channel);
            }

            this.channels = channelList;
            this.$emit('channelsReceived', this.channels);
        }
    },
    mounted() {
        this.$http.get('getchannels/').then(response => {
            response.json().then(json => this.channelRequestSuccess(json));
        }, error => this.channelRequestFailure(error));

        setInterval(() => {
            this.$http.get('getchannels/').then(response => {
                response.json().then(json => this.channelRequestSuccess(json));
            }, error => this.channelRequestFailure(error));
        }, 1000*12);
    }
}
</script>

<style lang="scss" scoped>
    .slide-enter {
        opacity: 0;
        transform: translateY(2em);
    }
    .slide-enter-active {
        transition: all $animSpeedMedium*1s $cubicNormal;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
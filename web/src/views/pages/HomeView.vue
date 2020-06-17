<template>
    <div>
        <div class="content-container">
            <message-slide></message-slide>
        </div>

        <section id="featured">
            <div class="content-container">
                <h2>Featured</h2>
                <!--<channel-list-item :channel="{name: 'Test', 
                info: { 
                    title: 'Das ist ein TitleDas ist ein TitleDas ist ein TitleDas ist ein TitleDas ist ein TitleDas ist ein TitleDas ist ein TitleDas ist ein Title',
                    artist: 'Artist'
                }}"></channel-list-item>-->

                <transition-group name="slide" tag="div" class="tsr_layout_tablelist" appear>
                    <channel-list-item v-for="channel in featuredChannels" :key="channel.id" :channel="channel"></channel-list-item>
                </transition-group>
            </div>
        </section>
        <section id="other">
            <div class="content-container">
                <h2>Weitere Channel</h2>
                <transition-group name="slide" tag="div" class="tsr_layout_tablelist" appear>
                    <channel-list-item v-for="channel in otherChannels" :key="channel.id" :channel="channel"></channel-list-item>
                </transition-group>
            </div>
        </section>
    </div>
</template>

<script>
import MessageSlide from '../../components/message/MessageSlide.vue';
import ChannelListItem from '../../components/ChannelListItem.vue';

export default {
    name: 'home',
    data() {
        return {
            channels: [],
        }
    },
    components: {
        ChannelListItem,
        MessageSlide
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
        }
    },
    methods: {
        channelRequestFailure(error){
            console.log(error);
        },
        channelRequestSuccess(data){
            var channelList = [];

            for(var channel of Object.values(data.payload)) {
                channel.coverURL = '/upload/channelCovers/'+channel.id+'.png';
                channelList.push(channel);

                if(this.$store.state.currentChannel.id == channel.id) {
                    var info = this.$store.state.currentChannel.info;

                    if(channel.info.title !== info.title && channel.info.artist !== info.artist) {
                        this.$store.state.currentChannel = channel;
                    }
                }
            }

            this.channels = channelList;
        }
    },
    mounted() {
        this.$http.get('getchannels/').then(response => {
            response.json().then(json => this.channelRequestSuccess(json));
        }, error => this.channelRequestFailure(error));

        setInterval(() => {
            console.log('interval');

            this.$http.get('getchannels/').then(response => {
                response.json().then(json => this.channelRequestSuccess(json));
            }, error => this.channelRequestFailure(error));
        }, 1000*12);
    },
    destroyed(){
        clearInterval();
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
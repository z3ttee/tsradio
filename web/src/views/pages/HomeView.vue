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
    components: {
        ChannelListItem,
        MessageSlide
    },
    computed: {
        channels() {
            return this.$root.$data.channels;
        },
        featuredChannels() {
            return this.$store.state.channels.filter((element) => {
                if(element.featured) return element;
            });
        },
        otherChannels() {
            return this.$root.$data.channels.filter((element) => {
                if(!+element.featured && !!+element.listed && element.isActive) return element;
            });
        }
    },
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
<template>
    <section>
        <app-channel-showcase v-if="!!getSpecialChannel" :channel="getSpecialChannel">
            <template #title><span class="badge badge-s">Special Edition</span> Channel Showcase</template>
        </app-channel-showcase>

        <transition name="animation_item_slide">
            <app-textbox v-if="featuredChannels.length <= 0 && otherChannels.length <= 0">
                Derzeit sind keine Channels aktiv. Hält dieses Problem länger an, dann kontaktiere bitte einen Administrator.
            </app-textbox>
        </transition>

        <transition name="animation_item_slide">
            <div class="container" v-if="featuredChannels.length > 0">
                <h3>Hervorgehobene Channels</h3>
                <div class="list-grid-wrapper">
                    <transition-group name="animation_item_slide" mode="out-in">
                        <app-channel-item v-for="(channel) in featuredChannels" :key="channel.uuid" :channel="channel"></app-channel-item>
                    </transition-group>
                </div>
            </div>
        </transition>

        <transition name="animation_item_slide">
            <div class="container" v-if="otherChannels.length > 0">
                <h3>Sonstige Channels</h3>
                <div class="list-grid-wrapper">
                    <transition-group name="animation_item_slide" mode="out-in">
                        <app-channel-item v-for="(channel) in otherChannels" :key="channel.uuid" :channel="channel"></app-channel-item>
                    </transition-group>
                </div>
            </div>
        </transition>
    </section>
</template>

<script>
import AppChannelItem from '@/components/lists/AppChannelItemComp.vue'

import AppChannelShowcase from '@/components/message/AppChannelShowcaseComp.vue'

export default {
    components: {
        AppChannelItem,
        AppChannelShowcase
    },
    computed: {
        featuredChannels() {
            let channels = Object.values(this.$store.state.channels)
            return channels.filter(c => c.featured && !c.special)
        },
        otherChannels() {
            let channels = Object.values(this.$store.state.channels)
            return channels.filter(c => !c.featured)
        },
        getSpecialChannel() {
            let channels = Object.values(this.$store.state.channels)
            let filtered = channels.filter(c => c.special)

            if(filtered.length > 0) {
                return filtered[0]
            } else {
                return undefined
            }
        },
        timeOfDay() {
            let time = new Date().getHours();

            if(time >= 18 || time >= 0 && time < 3) {
                return "Guten Abend"
            } else if(time >= 3 && time <= 11) {
                return "Guten morgen"
            } else {
                return "Guten Tag"
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/lists.scss";
</style>
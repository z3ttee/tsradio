<template>
    <section>
        <app-messagebox :banner="false">
            <template #title>Willkommen zurück!</template>
            <template #subtitle>TSRadio >> NEXT</template>
            <template #content>
                <p>TSRadio ist wieder zurück mit der besten Musik und den besten Channels! Zudem hat die Seite einen völlig überarbeiteten Look. <br>Beachte: Die Seite befindet sich noch immer in der BETA.</p>
            </template>
        </app-messagebox>

        <!--<app-channel-showcase>
            <template #title><span class="badge badge-s">Special Edition</span> Der neue TSR Christmas Channel!</template>
            <template #content>
                 <h2>Channel #1</h2>
                 <h4>Lie to me</h4>
                 <p>Depeche Mode</p>
            </template>
        </app-channel-showcase>-->

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
//import AppChannelShowcase from '@/components/message/AppChannelShowcaseComp.vue'

export default {
    components: {
        AppChannelItem
        //AppChannelShowcase
    },
    computed: {
        featuredChannels() {
            let channels = Object.values(this.$store.state.channels);
            return channels.filter(c => c.featured)
        },
        otherChannels() {
            let channels = Object.values(this.$store.state.channels);
            return channels.filter(c => !c.featured)
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/lists.scss";
</style>
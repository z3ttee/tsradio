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

        <h3>Hervorgehobene Channels</h3>
        <div class="list-grid-wrapper">
            <transition-group name="animation_item_slide">
                <app-channel-item v-for="(channel) in $store.state.channels" :key="channel.uuid" :channel="channel"></app-channel-item>
            </transition-group>
        </div>

        <h3>Sonstige Channels</h3>
    </section>
</template>

<script>
import AppChannelItem from '@/components/lists/AppChannelItemComp.vue'
//import AppChannelShowcase from '@/components/message/AppChannelShowcaseComp.vue'

export default {
    components: {
        AppChannelItem
        //AppChannelShowcase
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/lists.scss";
</style>
<template>
    <div class="content-wrapper">
        <app-announcement-box-comp>
            <h2>TSRadio >> NEXT</h2>
            <p>TSRadio ist zurück! Mit neuem Design und der besten Musik! Genieße ab jetzt die beste Musik der letzten Dekaden. <br> Aber beachte: Die Seite ist noch in der BETA-Phase!</p>
        </app-announcement-box-comp>

        <section>
            <!--<button class="btn btn-primary btn-m" @click="showTestModal">Show Modal</button>-->

            <h3>Hervorgehobene Channels</h3>
            <div class="list-grid-wrapper">
                <app-channel-list-item-comp v-for="channel in $store.state.channels" :key="channel.uuid" :channel="channel" @click="$store.state.currentChannel = channel"></app-channel-list-item-comp>
            </div>
        </section>
    </div>
</template>

<script>
import AppAnnouncementBoxComp from '@/components/message/AppAnnouncementBoxComp.vue'
import AppChannelListItemComp from '@/components/list/AppChannelListItemComp.vue'

//import AppLoginModal from '@/components/modal/AppLoginModal.vue'

export default {
    components: {
        AppAnnouncementBoxComp,
        AppChannelListItemComp
    },
    methods: {
        showTestModal() {
            const modal = {
                componentPath: "@/components/modal/AppLoginModal.vue"
            }

            this.$modal.show(modal)
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/lists.scss';
</style>
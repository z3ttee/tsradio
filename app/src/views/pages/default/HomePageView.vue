<template>
    <div class="content-wrapper">
        <app-announcement-box-comp>
            <h2>TSRadio >> NEXT</h2>
            <p>TSRadio ist zurück! Mit neuem Design und der besten Musik! Genieße ab jetzt die beste Musik der letzten Dekaden. <br> Aber beachte: Die Seite ist noch in der BETA-Phase!</p>
        </app-announcement-box-comp>

        <section>
            <h3>Hervorgehobene Channels</h3>
            <div class="list-grid-wrapper">
                <app-channel-list-item-comp></app-channel-list-item-comp>
                <app-channel-list-item-comp></app-channel-list-item-comp>
            </div>
        </section>
    </div>
</template>

<script>
import AppAnnouncementBoxComp from '@/components/message/AppAnnouncementBoxComp.vue'
import AppChannelListItemComp from '@/components/list/AppChannelListItemComp.vue'

export default {
    components: {
        AppAnnouncementBoxComp,
        AppChannelListItemComp
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/lists.scss';
</style>
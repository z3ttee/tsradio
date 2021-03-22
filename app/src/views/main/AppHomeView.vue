<template>
    <section>
        <transition-group name="anim_item_slide" mode="out-in" appear>
            <app-info-box v-if="showLoadingWarning">
                Es scheint, als wären derzeit keine Channels online. Sobald sich dies ändert, wirst du alle Channels hier aufgelistet sehen.
            </app-info-box>
        </transition-group>

        <transition name="anim_item_fade" mode="out-in" appear>
            <app-showcase-item :channels="getShowcased" v-if="getShowcased.length > 0" @selected="selectChannel"></app-showcase-item>
        </transition>

        <transition name="anim_item_fade" mode="out-in" appear>
            <app-skeleton-grid v-if="showSkeleton"></app-skeleton-grid>
            <div class="grid-wrapper" v-else-if="getTopFeatured.length > 0">
                <div class="grid-container">
                    <transition-group name="anim_item_slide" mode="out-in" appear>
                        <app-grid-item v-for="channel of getTopFeatured" :key="channel.uuid" :itemUuid="channel.uuid" :itemName="channel.title" :itemTitle="channel.info?.title" :itemSubtitle="channel.info?.artist" :itemListeners="channel.listeners" :itemColor="channel.colorHex" :itemTimestamp="channel.info?.cover" @selected="selectChannel(channel.uuid)"></app-grid-item>
                    </transition-group>
                </div>
            </div>
        </transition>

        <transition name="anim_item_fade" mode="out-in" appear>
            <app-skeleton-grid v-if="showSkeleton">
                <template #headline>Weitere Channels</template>
            </app-skeleton-grid>

            <div class="grid-wrapper" v-else-if="getNonFeatured.length > 0">
                <h4 v-if="getShowcased.length != 0 && getTopFeatured.length != 0">Weitere Channels</h4>
                <div class="grid-container">
                    <transition-group name="anim_item_slide" mode="out-in" appear>
                        <app-grid-item v-for="channel of getNonFeatured" :key="channel.uuid" :itemUuid="channel.uuid" :itemName="channel.title" :itemTitle="channel.info?.title" :itemSubtitle="channel.info?.artist" :itemListeners="channel.listeners" :itemColor="channel.colorHex" :itemTimestamp="channel.info?.cover" @selected="selectChannel(channel.uuid)"></app-grid-item>
                    </transition-group>
                </div>
            </div>
        </transition>

        <transition name="anim_item_fade" mode="out-in" appear>
            <div class="grid-wrapper" v-if="getPreparing.length > 0 && $account.hasPermission('permission.channels.read')">
                <h4>In Vorbereitung <span class="badge">Admin</span></h4>
                <div class="grid-container">
                    <transition-group name="anim_item_slide" mode="out-in" appear>
                        <app-grid-item v-for="channel of getPreparing" :key="channel.uuid" :itemUuid="channel.uuid" :itemName="channel.title" :itemTitle="channel.info?.title" :itemSubtitle="channel.info?.artist" :itemListeners="channel.listeners" :itemColor="channel.colorHex" :itemTimestamp="channel.info?.cover" :disabled="true"></app-grid-item>
                    </transition-group>
                </div>
            </div>
        </transition>

        <transition name="anim_item_fade" mode="out-in" appear>
            <div class="grid-wrapper" v-if="getDisabled.length > 0 && $account.hasPermission('permission.channels.read')">
                <h4>Derzeit inaktiv <span class="badge">Admin</span></h4>
                <div class="grid-container">
                    <transition-group name="anim_item_slide" mode="out-in" appear>
                        <app-grid-item v-for="channel of getDisabled" :key="channel.uuid" :itemUuid="channel.uuid" :itemName="channel.title" :itemTitle="channel.info?.title" :itemSubtitle="channel.info?.artist" :itemListeners="channel.listeners" :itemColor="channel.colorHex" :itemTimestamp="channel.info?.cover" :disabled="true"></app-grid-item>
                    </transition-group>
                </div>
            </div>
        </transition>

    </section>
</template>

<script lang="js">
import AppGridItem from '@/components/item/AppGridItem.vue'
import AppSkeletonGrid from '@/components/grids/AppSkeletonGrid.vue'
import AppInfoBox from '@/components/message/AppInfoBox.vue'
import AppShowcaseItem from '@/components/item/AppShowcaseItem.vue'

export default {
    data() {
        return {
            showLoadingWarning: false,
            showSkeleton: true,
            timeout: undefined
        }
    },
    components: {
        AppGridItem,
        AppSkeletonGrid,
        AppInfoBox,
        AppShowcaseItem
    },
    computed: {
        getOrderedList() {
            var values = Object.values(this.$store.state.channels).sort((a, b) => { return b.order - a.order })
            return values
        },
        getShowcased() {
            var values = this.getOrderedList.filter((channel) => channel && channel.featured && channel.enabled && channel.activeSince)
            return values.slice(0, 2)
        },
        getTopFeatured() {
            var values = this.getOrderedList.filter((channel) => channel && channel.featured && channel.enabled && channel.activeSince)
            return values.slice(2, values.length)
        },
        getNonFeatured() {
            return this.getOrderedList.filter((channel) => channel && !channel.featured && channel.enabled && channel.activeSince)
        },
        getDisabled() {
            return this.getOrderedList.filter((channel) => channel && (!channel.enabled || !channel.activeSince))
        },
        getPreparing() {
            return this.getOrderedList.filter((channel) => channel && channel.enabled && channel.channelState == 3)
        },
        getAll() {
            return this.getOrderedList.filter((channel) => channel && channel.activeSince)
        }
    },
    watch: {
        getAll() {
            if(this.getAll.length > 0) {
                this.showLoadingWarning = false
                this.showSkeleton = false
            } else {
                this.showLoadingWarning = true
                this.showSkeleton = true
            }
        }
    },
    methods: {
        selectChannel(uuid) {
            this.$channel.select(uuid)
            this.$router.push({name: 'channel', params: { channelId: uuid }})
        }
    },
    mounted() {
        this.timeout = setTimeout(() => {
            if(this.getAll.length <= 0) {
                this.showLoadingWarning = true
            } 
        }, this.$store.state.config.api.connectionTimeout)

        setTimeout(() => {
            this.showSkeleton = (this.getAll.length <= 0)
        }, 300)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/elements/lists.scss";
</style>
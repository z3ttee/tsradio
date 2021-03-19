<template>
    <div class="grid-wrapper">
        <h4><slot name="headline"></slot></h4>
        <div class="grid-container">
            <app-grid-item-skeleton v-for="count of itemCount" :key="count + generateId(6)"></app-grid-item-skeleton>
        </div>
    </div>
</template>

<script>
import AppGridItemSkeleton from '@/components/item/AppGridItemSkeleton.vue'

export default {
    components: {
        AppGridItemSkeleton
    },
    data() {
        return {
            itemCount: 4
        }
    },
    methods: {
        calculateItemCount() {
            if(window.innerWidth > 900) {
                this.itemCount = 4
                return
            }
            if(window.innerWidth > 700 && window.innerWidth <= 900) {
                this.itemCount = 3
                return
            }
            if(window.innerWidth <= 700) {
                this.itemCount = 2
                return
            }
        }
    },
    mounted() {
        this.calculateItemCount()
        window.addEventListener('resize', this.calculateItemCount)
    },
    unmounted() {
        window.removeEventListener('resize', this.calculateItemCount)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/elements/lists.scss";
</style>
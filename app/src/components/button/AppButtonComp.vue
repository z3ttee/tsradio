<template>
        <button @click.prevent="onClicked">
            <slot v-if="!loading"></slot>
            <v-lottie-player class="animation-wrapper" width="24px" height="24px" loop autoplay :animationData="loaderData" v-else></v-lottie-player>
        </button>
</template>

<script>
import loaderData from '@/assets/animated/loader.json'

export default {
    data() {
        return {
            loaderData,
            loading: false
        }
    },
    methods: {
        onClicked(event) {
            if(this.loading) return

            this.loading = true
            this.$emit('clicked', event, () => this.loading = false)
        }
    }
}
</script>
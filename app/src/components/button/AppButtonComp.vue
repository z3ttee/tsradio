<template>
        <button @click.prevent="onClicked" :disabled="loading">
            <span :class="{'hidden': loading}"><slot></slot></span>
            <v-lottie-player :class="{'animation': true, 'hidden': !loading}" width="24px" height="24px" loop autoplay :animationData="loaderData"></v-lottie-player>
        </button>
</template>

<script>
import loaderData from '@/assets/animated/primary_loader_light.json'

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

<style lang="scss" scoped>
button {
    position: relative;

    .animation {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        pointer-events: none;
    }
}

.hidden {
    opacity: 0;
}
</style>
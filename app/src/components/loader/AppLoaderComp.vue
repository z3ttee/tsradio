<template>
    <v-lottie-player 
        :width="width+'px'"
        :height="height+'px'"
        loop 
        autoplay 
        :animationData="animData">
    </v-lottie-player>
</template>

<script>
import loaderData from '@/assets/animated/loader_light.json'

export default {
    props: {
        animData: {
            type: Object,
            default: loaderData
        },
        width: {
            type: Number,
            default: 24
        },
        height: {
            type: Number,
            default: 24
        }
    }
}
</script>

<style lang="scss">
.inline {
    display: inline-block;
    vertical-align: middle;
}
</style>
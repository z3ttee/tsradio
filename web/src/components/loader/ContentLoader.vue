<template>
    <loader classes="loader" :settings="{ autoplay: true, loop: true }"></loader>
</template>

<script>
import Loader from '@/components/loader/PrimaryLoader.vue';

export default {
    components: {
        Loader
    }
}
</script>

<style lang="scss" scoped>
    .loader {
        display: block;
        width: 64px;
        height: 64px;
        margin: 0 auto;
    }
</style>
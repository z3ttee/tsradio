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
        position: absolute;
        display: block;
        width: 64px;
        height: 64px;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }
</style>
<template>
    <lottie-player :class="classes" :src="loader" :options="settings"></lottie-player>
</template>

<script>
import Loader from '@/assets/animated/loader/primary.json';
import LoaderLight from '@/assets/animated/loader/primary_light.json';

export default {
    props: ["settings","classes","light"],
    computed: {
        loader() {
            if(this.light) {
                return LoaderLight
            } else {
                return Loader
            }
        }
    }
}
</script>
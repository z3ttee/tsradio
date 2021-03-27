<template>
    <div :class="'background-wrapper '">
        <div class="background-image">
            <app-placeholder-image class="background-image" :resourceId="channel?.uuid" resourceType="song" :resourceKey="channel?.info?.cover" :placeholder="placeholderImage"></app-placeholder-image>
        </div>
        <div class="background-overlay"></div>
    </div>
</template>

<script>
import * as backgroundImagePlaceholder from "@/assets/images/background/background_blurred.png"
import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'

export default {
    components: {
        AppPlaceholderImage
    },
    computed: {
        channel() {
            return this.$store.state.activeChannel
        },
        placeholderImage() {
            return backgroundImagePlaceholder
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    pointer-events: none;
    border: none;
    transition: all $animSpeedFast*1s $cubicNorm;
    z-index: 0;

    .background-image {
        height: 100%;
        width: 100%;
        pointer-events: none;
        filter: blur(15px);
        border: none;
        transition: all $animSpeedFast*1s $cubicNorm;
    }
    .background-overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        opacity: 0.8;
        pointer-events: none;
        background-color: $colorPrimaryDark;
        border: none;
    }
}
</style>
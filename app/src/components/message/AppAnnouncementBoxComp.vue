<template>
    <div class="announcement-box">
        <slot></slot>
        <v-lottie-player class="animation-wrapper" width="256px" height="256px" loop autoplay :animationData="AnnouncementAnimData"></v-lottie-player>
    </div>
</template>

<script>
import AnnouncementAnimData from '@/assets/animated/announcement.json'

export default {
    props: {
        content: String
    },
    data() {
        return {
            AnnouncementAnimData
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.announcement-box {
    position: relative;
    display: block;
    background-color: rgba($color: $colorPlaceholder, $alpha: 0.8);
    border-radius: $borderRadSmall;
    box-shadow: $shadowNormal;
    min-height: 200px;
    padding: $windowPad;
    margin-top: 5em;
    margin-bottom: 2em;
    padding-left: 17em;

    .animation-wrapper {
        display: inline-block;
        width: 500px;
        position: absolute;
        top: -40%;
        left: 0;
    }
}
</style>
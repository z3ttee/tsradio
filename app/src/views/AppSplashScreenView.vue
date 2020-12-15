<template>
    <div :class="{ 'splash-screen': true, 'hide': $store.state.appIsReady }">
        <div class="loading-container">
            <div class="content-container">
                <img src="@/assets/images/branding/ts_logo_svg.svg" alt="">
                <v-lottie-player class="animator" width="24px" height="24px" loop autoplay :animationData="loaderData"></v-lottie-player>
            </div>
        </div>
    </div>
</template>

<script>
import errorData from '@/assets/animated/error404.json'
import loaderData from '@/assets/animated/primary_loader_light.json'

export default {
    data() {
        return {
            loaderData,
            errorData
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.splash-screen {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;

    opacity: 1;
    width: 100%;
    height: 100%;

    background: linear-gradient(114deg, $colorPrimaryDarker, $colorPlaceholder);
    background-size: 200% 200%;
    animation: splashGradientAnim 5s ease infinite;
    transition: all $animSpeedLong*1s $cubicNorm;

    pointer-events: all;

    &.hide {
        transform: scale(0.9);
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
    }
}

.loading-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%,-50%);
    text-align: center;

    img {
        display: block;
        height: 45px;
        width: 45px;
    }

    .animator {
        margin-top: 0.5em;
        vertical-align: middle;
    }
}

@keyframes splashGradientAnim {
    0%{background-position:0% 44%}
    50%{background-position:100% 57%}
    100%{background-position:0% 44%}
}
</style>
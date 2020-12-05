<template>
    <div class="showcase-wrapper">
        <div class="showcase-container">
            <h4><slot name="title"></slot></h4>

            <div class="showcase-description" v-if="channel">
                <h2>{{ channel.title }}</h2>

                <div class="showcase-track-details">
                    <p>{{ channel.info.title }}</p>
                    <p>{{ channel.info.artist }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        channel: Object,
        default: {}
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.showcase-wrapper {
    position: relative;
    display: block;
    width: 100%;
    padding-top: 30%;

    background: $gradientBox;
    box-shadow: $shadowNormal;
    
    border: 3px solid $colorPlaceholder;
    border-radius: $borderRadSmall;
    overflow: hidden;
}

.showcase-container {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    background: none;
    top: 0;
    left: 0;
    padding: 1em;

    .showcase-description {
        padding: 1.5em;
        position: absolute;
        display: block;
        width: 100%;
        bottom: 0;
        left: 0;
    }
}

@media screen and (max-width: 950px) {
    .showcase-wrapper {
        padding-top: 35%;
    }
}
@media screen and (max-width: 640px) {
    .showcase-wrapper {
        padding-top: 45%;
    }
}
@media screen and (max-width: 400px) {
    .showcase-wrapper {
        padding-top: 55%;
    }
}
</style>
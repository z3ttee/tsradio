<template>
    <div class="lyrics-skeleton">
        <div class="skeleton-first">
            <h6></h6>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
        </div>

        <div class="skeleton-second">
            <h6></h6>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
        </div>

        <div class="skeleton-third">
            <h6></h6>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
            <p :style="'width: ' + getRandomWidthPercentage() + '%;'"></p>
            <div class="clearfix"></div>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        getRandomWidthPercentage() {
            var rnd = Math.random() * (80 - 20) + 20;
            return rnd
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
@import "@/assets/scss/animations.scss";

.clearfix {
    clear: both;
}

.lyrics-skeleton {
    display: block;
    background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
    animation: anim_blink 2s ease infinite;
    border-radius: $borderRadSmall;
    padding: $boxPad;
    width: 100%;

    h6 {
        display: block;
        width: 30%;
        height: 28px;
        margin-bottom: 0.8em;
        background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
    }

    p {
        display: inline-block;
        width: 20%;
        height: 18px;
        background-color: rgba($color: $colorGrayLight, $alpha: 0.3);

        &:last-of-type {
            margin-bottom: 2em;
        }
    }
}

</style>
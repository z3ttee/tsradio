<template>
    <div class="cover-container">
        <!-- Secondary cover -->
        <div :class="{'cover-item secondary-cover': true, 'state-reveal': reveal && secondaryEnabled }" v-if="secondaryEnabled">
            <div class="cover-plate" :id="itemId+'secondary'" :style="'background-image: url('+secondaryImage + ')'"></div>
        </div>

        <!-- Main cover -->
        <div :id="itemId+'main'" :class="{'cover-item main-cover': true, 'state-reveal': reveal && secondaryEnabled }" :style="'background-image: url('+mainImage + ')'"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            itemId: this.makeid(6)
        }
    },
    props: {
        reveal: {
            type: Boolean,
            default: false
        },
        mainImage: {
            type: String,
            default: ""
        },
        secondaryImage: {
            type: String,
            default: ""
        },
        secondaryEnabled: {
            type: Boolean,
            default: true
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

@mixin background {
    background: $colorPlaceholder;
    background-size: cover;
    background-position: center;
    border-top-right-radius: $borderRadSmall;
    border-bottom-right-radius: $borderRadSmall;
}

.cover-container {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;

    border-radius: $borderRadSmall;

    .cover-item {
        position: absolute;
        top: 3px;
        left: 0;
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: $borderRadSmall;

        transition: all $animSpeedNormal*1s $cubicNorm;
        box-shadow: $shadowNormal;

        &.secondary-cover {
            border-radius: 50%;
            z-index: 2;
            width: 90%;
            height: 90%;
            top: 55%;
            transform: translateY(-50%) translateX(0);

            .cover-plate {
                display: inline-block;
                width: 100%;
                height: 100%;
                border-radius: 50% !important;
                animation: rotating 3.5s linear infinite;
                animation-play-state: paused;

                @include background();
            }
        }
        &.main-cover {
            z-index: 3;
            @include background();
        }

        &.state-reveal {
            &.main-cover {
                transform: rotate(3deg);
                transform-origin: bottom left;
            }

            &.secondary-cover {
                transform: translateY(-55%) translateX(-60%);
                transform-origin: center;

                .cover-plate {
                    animation-play-state: running;
                }
            }
        }

        
    }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
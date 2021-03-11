<template>
    <div class="item" :id="itemId + 'content'">
        <div class="item-wrapper">
            <div class="item-container">
                <div class="item-header">
                    <div class="header-icon"></div>
                    <div class="header-title">
                        <span></span>
                    </div>
                </div>

                <div class="item-details">
                    <span></span>
                </div>

                <div class="item-info">
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            itemId: this.generateId(6),
            observer: undefined,
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

$itemHeaderHeight: 64px;
$borderRad: $borderRadSmall;

@mixin containerAnim {
    border-radius: $borderRad + 3px;
    transform: translate(5px, -5px);
}

@mixin absWithFullHeight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

@mixin transition {
    transition: all $animSpeedNormal*1s ease;
}

.item {
    position: relative;
    align-self: stretch;
    display: inline-block;
    width: 100%;
    padding-top: 100%;

    .item-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        .item-container {
            @include transition();
            height: 100%;
            z-index: 3;
            position: relative;
            border-radius: $borderRad;
            overflow: hidden;

            background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
            animation: anim_blink 2s ease infinite;
        }
    
        .item-header {
            position: relative;
            display: inline-block;
            width: 100%;
            min-height: $itemHeaderHeight;

            .header-icon {
                position: absolute;
                top: 0px;
                left: 0;
                width: $itemHeaderHeight;
                height: $itemHeaderHeight;
                border-bottom-right-radius: $borderRad;
                background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
            }

            .header-title {
                display: block;
                width: 100%;
                
                text-align: right;
                padding: 0.8em;
                padding-left: $itemHeaderHeight + 10px;

                span {
                    display: inline-block;
                    width: 80%;
                    height: $itemHeaderHeight/2;
                    background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
                }
            }
        }

        .item-details {
            position: absolute;
            left: 0;
            top: $itemHeaderHeight + 5px;
            width: $itemHeaderHeight;
            color: $colorAccentLight;

            span {
                display: block;
                width: 60%;
                height: $itemHeaderHeight/3;
                background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
            }
        }

        .item-info {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: $boxPad;

            span {
                display: inline-block;
                background-color: rgba($color: $colorGrayLight, $alpha: 0.3);

                &:first-of-type {
                    height: $itemHeaderHeight/2.8;
                    width: 70%;
                }
                &:last-of-type {
                    height: $itemHeaderHeight/3.5;
                    width: 50%;
                }
            }
        }
    }
}

@keyframes anim_blink {
    0% {
        background-color: rgba($color: $colorGrayLight, $alpha: 0.3);
    }
    50% {
        background-color: rgba($color: $colorGrayLight, $alpha: 0.6);
    }
    100% {
        background-color: rgba($color: $colorGrayLight, $alpha: 0.3)
    }
}

@media screen and (max-width: 500px) {
    .item {
        margin-bottom: 16px;
        padding-top: 0;

        .item-wrapper {
            position: static;
            height: 170px;

            &::after {
                display: none !important;
            }

            &:hover {
                .item-container {
                    transform: none !important;
                }
            }
        }

        .header-title {
            text-align: left !important;
        }
    }
}
</style>
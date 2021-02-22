<template>
    <div class="item">
        <div class="item-wrapper" :style="item?.colorHex ? 'background-color: ' + item.colorHex +  ';' : ''">
            <div class="item-container">
                <div class="item-header">
                    <div class="header-icon">

                    </div>
                    <div class="header-title">
                        <h5>Wipfrawelle</h5>
                    </div>
                </div>

                <div class="item-details">
                    0 <img src="@/assets/icons/headphones.svg">
                </div>

                <div class="item-info">
                    <p>Lie to me</p>
                    <p>Depeche Mode</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        item: Object
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";
$itemHeaderHeight: 50px;

.item {
    position: relative;
    align-self: stretch;
    display: inline-block;
    width: 100%;
    padding-top: 100%;

    .item-wrapper {
        position: absolute;
        top: 16px;
        left: 16px;
        bottom: 16px;
        right: 16px;
        cursor: pointer;

        &::after {
            position: absolute;
            top: 0px;
            left: 0px;
            right: 1px;
            bottom: 1px;
            content: "";
            background-color: $colorAccentLight;
            transition: all 0.1s linear;
            border-radius: $borderRadSmall+2px;
        }

        .item-container {
            height: 100%;
            z-index: 3;
            position: relative;
            background-color: $colorPrimary;
            border-radius: $borderRadSmall;
            overflow: hidden;
            transition: all $animSpeedNormal*1s ease;
        }

        &:hover {
            &::after {
                right: 0;
                bottom: 0;
            }
            .item-container {
                border-radius: $borderRadSmall + 3px;
                transform: translate(5px, -5px);
            }
        }
    
        .item-header {
            position: relative;
            display: inline-block;
            width: 100%;
            min-height: $itemHeaderHeight;

            .header-icon {
                position: absolute;
                top: 0;
                left: 0;
                width: $itemHeaderHeight;
                height: $itemHeaderHeight;
                background-color: $colorPlaceholder;
                border-bottom-right-radius: $borderRadSmall;
                
                img {
                    display: inline-block;
                    width: inherit;
                    height: inherit;
                    vertical-align: middle;
                }
            }
            .header-title {
                display: block;
                width: 100%;
                
                text-align: right;
                padding: 0.8em;
                padding-left: $itemHeaderHeight+10px;

                word-break: break-all;
            }
        }

        .item-details {
            position: absolute;
            left: 0;
            top: $itemHeaderHeight + 5px;
            width: $itemHeaderHeight;
            color: $colorAccentLight;
            
            text-align: center;
            font-size: 0.8em;

            img {
                margin-left: 0.2em;
                height: 12px;
                vertical-align: middle;
            }
        }

        .item-info {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: $boxPad;

            p {
                font-family: 'Poppins';
                &:first-of-type {
                    font-size: 1em;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                }
                &:last-of-type {
                    opacity: 0.5;
                    font-weight: 400;
                    font-size: 0.75em;
                }
            }
        }
    }
}

@media screen and (max-width: 500px) {
    .item {
        margin-bottom: 16px;
        padding-top: 0;

        .item-wrapper {
            position: static;
            height: 150px;

            &:hover {
                .item-container {
                    transform: none;
                }
            }
        }

        .header-title {
            text-align: left !important;
        }
    }
}
</style>
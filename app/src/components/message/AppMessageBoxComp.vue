<template>
    <div class="message-box">
        <div class="inner-box">
            <div class="layout-table">
                <div class="layout-col banner-col banner-col-xl" v-if="banner">
                    <slot name="banner"><img src="@/assets/images/branding/ts_radio_banner.svg" alt=""></slot>
                </div>
                <div class="layout-col">
                    <h6><slot name="subtitle"></slot></h6>
                    <h3><slot name="title"></slot></h3>
                    <div class="content" v-if="hasContentSlot"><slot name="content"></slot></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        banner: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        hasContentSlot() {
            return !!this.$slots['content']
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.layout-col {
    vertical-align: middle;
}

.message-box {
    border-radius: $borderRadSmall;
    letter-spacing: 0;
    text-align: left;

    h6 {
        color: $colorAccentLight;
        line-height: 1em;
    }

    h3 {
        span {
            color: $colorAccent;
        }
    }

    .content {
        margin-top: 1em;
        text-align: left;
    }

    .inner-box {
        border-radius: $borderRadSmall;
    }

    &.box-error {
        background-color: initial;
        
        .inner-box {
            background-color: initial;
            border: 2px solid $colorAccent;
        }
    }
}
</style>
<template>
    <div class="avatar-container">
        <span v-if="hasText"><slot></slot></span>
        <app-placeholder-image class="avatar icon-m" :resourceId="$store.state.account.uuid" :resourceType="'avatar'"></app-placeholder-image>
    </div>
</template>

<script>
import AppPlaceholderImage from '@/components/image/AppPlaceholderImage.vue'

export default {
    components: {
        AppPlaceholderImage
    },
    computed: {
        avatarUrl() {
            return this.$store.state.urls.avatarBase + "undefined"
        },
        hasText() {
            return !!this.$slots.default
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.avatar-container {
    display: inline-block;
    vertical-align: middle;
    height: 100%;

    span {
        display: inline;
        vertical-align: middle;
        margin-right: 0.5em;
    }

    .avatar {
        display: inline-block;
        vertical-align: middle;
        height: 100%;
        min-width: 24px;
        border-radius: 50%;
        overflow: hidden;
    }
}


@media screen and (max-width: 540px) {
    .avatar-container {
        span {
            display: none !important;
        }
    }
}
</style>

<style lang="scss">
@import "@/assets/scss/elements/avatar.scss";
</style>
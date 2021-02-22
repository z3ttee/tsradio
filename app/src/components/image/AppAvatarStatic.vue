<template>
    <div class="avatar-container">
        <span v-if="hasText"><slot></slot></span>
        <img :src="avatarUrl">
    </div>
</template>

<script>
export default {
    props: {
        avatar: String
    },
    computed: {
        avatarUrl() {
            return this.$store.state.avatarBaseUrl + this.avatar
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

    img {
        display: inline-block;
        vertical-align: middle;
        height: 100%;
        min-width: 24px;
        
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
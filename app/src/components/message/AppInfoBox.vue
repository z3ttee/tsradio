<template>
    <div class="message-box message-info" v-if="hasMessage">
        <div class="layout-table">
            <div class="layout-col">
                <img class="icon-s" src="@/assets/icons/information.svg" alt="">
            </div>

            <div class="layout-col">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        hasMessage() {
            return !!this.$slots.default
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-table {
    .layout-col {
        vertical-align: middle;

        &:first-of-type {
            width: 38px;
        }

    }
}
</style>
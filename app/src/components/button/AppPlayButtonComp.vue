<template>
    <div class="button-wrapper" @click="toggle">
        <app-loader class="src-loader" v-if="loading"></app-loader>
        <transition name="animation_item_scale" mode="out-in">
            <button class="btn btn-icon btn-m" v-if="modelValue"><img src="@/assets/icons/play.svg" alt=""></button>
            <button class="btn btn-icon btn-m" v-else><img src="@/assets/icons/pause.svg" alt=""></button>
        </transition>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,
        loading: Boolean
    },
    emits: ['update:modelValue'],
    methods: {
        toggle() {
            this.$emit('update:modelValue', !this.modelValue)
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.button-wrapper {
    display: inline-block;
    position: relative;

    .src-loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 45px !important;
        height: 45px !important;
    }
}
</style>
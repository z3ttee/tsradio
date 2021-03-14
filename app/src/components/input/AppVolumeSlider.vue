<template>
    <div class="range-slider">
        <transition name="animation_item_scale" mode="out-in">
            <button class="btn btn-icon btn-m" @click="mute(true)" v-if="modelValue > 0"><img src="@/assets/icons/speaker.svg" alt=""></button>
            <button class="btn btn-icon btn-m" @click="mute(false)" v-else><img src="@/assets/icons/mute-speaker.svg" alt=""></button>
        </transition>

        <input type="range" :max="max" :min="min" @input="input" :value="modelValue">
    </div>
</template>

<script>
export default {
    data() {
        return {
            prevValue: 0
        }
    },
    props: {
        modelValue: Number,
        max: {
            type: Number,
            default: 100
        },
        min: {
            type: Number,
            default: 0
        },
        step: {
            type: Number,
            default: 1
        }
    },
    emits: ['update:modelValue'],
    methods: {
        input(event) {
            this.prevValue = parseInt(event.target.value)
            this.$emit('update:modelValue', parseInt(event.target.value))
        },
        mute(mute) {
            this.$emit('update:modelValue', mute ? 0 : this.prevValue)
        }
    },
    mounted() {
        this.prevValue = this.modelValue || this.max / 2
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.range-slider {
    display: inline-block;
    position: relative;
}

input[type=range] {
    width: 80px;
    height: 4px;
    background: $colorPlaceholder;
    outline: none;
    -webkit-appearance: none;
    border: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: $colorAccent;
        border-radius: 50%;
        transition: all $animSpeedFast*1s $cubicNorm;
    }
        
    &::-moz-range-thumb {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: $colorAccent;
        transition: all $animSpeedFast*1s $cubicNorm;
    }
}
</style>
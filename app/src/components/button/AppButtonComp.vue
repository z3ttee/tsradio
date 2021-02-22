<template>
    <button @click.prevent="onClicked" :disabled="loading">
        <span :class="{'hidden': loading}"><slot></slot></span>
        <app-loader :class="{'animation': true, 'hidden': !loading}" v-if="loading"></app-loader>
    </button>
</template>

<script lang="js">
export default {
    data() {
        return {
            loading: false
        }
    },
    emits: ['clicked'],
    methods: {
        onClicked(event) {
            if(this.loading) return
            this.loading = true
            this.$emit('clicked', event, () => this.loading = false)
        }
    }
}
</script>

<style lang="scss" scoped>
button {
    position: relative;
    
    .animation {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        pointer-events: none;
    }
}
.hidden {
    opacity: 0;
}
</style>
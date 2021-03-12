<template>
    <div class="wrappable-text" :id="itemId">
        <h6 :id="itemId + 'description'" class="text-subtitle" :style="accentColorHex ? 'color: ' + accentColorHex + ';' : ''" v-if="hasSubtitle"><slot name="subtitle"></slot></h6>
        <h2 :id="itemId + 'title'" class="text-title"><slot name="title"></slot></h2>
    </div>
</template>

<script>
import clamp from 'clamp-js'

export default {
    data() {
        return {
            itemId: this.generateId(6)
        }
    },
    props: {
        accentColorHex: String
    },
    computed: {
        hasSubtitle() {
            return !!this.$slots.subtitle
        }
    },
    mounted() {
        setTimeout(() => {
            this.observer = new ResizeObserver(() => {
                try {
                    clamp(document.getElementById(this.itemId + 'description'), {clamp: 1, useNativeClamp: true, animate: true})
                    clamp(document.getElementById(this.itemId + 'title'), {clamp: 2, useNativeClamp: true, animate: true})
                } catch (error) { 
                    /* Do nothing */ 
                    this.observer = undefined
                }
            })
            this.observer.observe(document.getElementById(this.itemId))
        }, 100)
    },
    unmounted() {
        try {
            if(document.getElementById(this.itemId)) {
                this.observer.unobserve(document.getElementById(this.itemId))
            }
        } catch (error) { /* Do nothing */ }
    }
}
</script>

<style lang="scss" scoped>

.wrappable-text {
    line-height: 2em;

    .text-subtitle {
        font-family: 'Whitney';
        font-size: 1em;
        margin-bottom: 0.3em;
        line-height: 1.5em;
    }
    .text-title {
        line-height: inherit;
        font-weight: 800;
    }
}

</style>
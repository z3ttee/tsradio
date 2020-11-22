<template>
    <component :is="modalComp" :modal="modal"></component>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
    props: {
        modal: Object
    },
    computed: {
        modalComp() {
            return defineAsyncComponent({
                loader: () => import(this.modal.componentPath)
            })
        }
    },
    mounted() {
        console.log(this.modal)
    }
}
</script>

<!--<style lang="scss">
@import '@/assets/scss/modal.scss';
</style>-->
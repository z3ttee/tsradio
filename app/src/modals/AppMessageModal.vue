<template>
    <app-modal>
        <template #title v-if="hasTitle">
            <p>{{ content?.title }}</p>
        </template>
        <template #content>
            <p>{{ content?.message }}</p>
        </template>
        <template #footer>
            <app-button class="btn btn-primary btn-m" @clicked="executePositiveCallback">OK</app-button>
        </template>
    </app-modal>
</template>

<script>
export default {
    props: {
        content: Object
    },
    computed: {
        hasTitle() {
            return !!this.content?.title
        }
    },
    methods: {
        next() {
            this.$modal.dismiss()
        },
        executePositiveCallback(event, done) {
            if(this.content?.onPositive) {
                this.content.onPositive(() => {
                    done()
                    this.next()
                })
            } else {
                done()
                this.next()
            }
        }
    }
}
</script>
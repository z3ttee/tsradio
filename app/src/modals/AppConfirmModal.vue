<template>
    <app-modal>
        <template #title v-if="hasTitle">
            <p>{{ content?.title }}</p>
        </template>
        <template #content>
            <p>{{ content?.message }}</p>
            <p><b>{{ content?.value }}</b></p>
            <br>

            <div class="form-group">
                <input class="editmode" type="text" name="input_value" id="input_value">
            </div>
        </template>
        <template #footer>
            <button class="btn btn-primary btn-tertiary btn-m" @click="executeNegativeCallback">Abbrechen</button>
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
        },
        executeNegativeCallback() {
            if(this.content?.onNegative) {
                this.content.onNegative(this.next)
            } else {
                this.next()
            }
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/scss/elements/forms.scss";
</style>
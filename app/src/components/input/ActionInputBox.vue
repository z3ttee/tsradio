<template>
    <div class="action-input-box" :id="itemID+'wrapper'">
        <label :for="itemID"><slot name="label"></slot></label>

        <div class="layout-table nobreak">
            <div class="layout-col">
                <input :id="itemID" :type="type" :class="{'editmode': editMode}" :disabled="!editMode" :value="modelValue" @input="value = $event.target.value">
            </div>
            <div class="layout-col">
                <app-button :class="{'btn btn-primary btn-m btn-full btn-text-center': true, 'btn-success': editMode }" @clicked="toggleEditmode">
                    <span v-if="!editMode">Bearbeiten</span>
                    <span v-else>Speichern</span>
                </app-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: "text"
        },
        modelValue: {
            type: String
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            editMode: false,
            itemID: this.generateId(6),
            value: this.modelValue
        }
    },
    methods: {
        toggleEditmode(event, done) {
            if(this.editMode) {
                this.inputSaved(done)
            }
            if(!this.editMode) {
                this.editMode = true
                done()
                setTimeout(() => {
                    document.getElementById(this.itemID).focus()
                }, 10)                
            }
        },
        inputSaved(done) {
            let fieldName = document.getElementById(this.itemID+'wrapper').getAttribute('data-field') || 'unknownField'
            let data = {}
            data[fieldName] = this.value
            let callback = (result) => {
                done()
                if(result === 'success') this.editMode = false
            }
            
            this.$emit('saved', data, callback)
        }
    },
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/elements/forms.scss";

.layout-table {
    .layout-col {
        vertical-align: middle;
        &:first-of-type {
            padding-right: 1em;
        }
        &:last-of-type {
            width: 120px;
        }
    }
}
</style>
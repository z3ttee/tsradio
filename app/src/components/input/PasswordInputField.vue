<template>
    <label :for="itemID"><slot name="label"></slot></label>
    <input :id="itemID" type="password" class="editmode" :value="modelValue" @input="inputSaved($event.target.value)">
</template>

<script>
export default {
    props: {
        modelValue: {
            type: String
        }
    },
    emits: ['update:modelValue', 'updated'],
    data() {
        return {
            itemID: this.makeid(6),
            value: this.modelValue
        }
    },
    methods: {
        inputSaved(value) {
            this.$emit('updated', value)
            this.$emit('update:modelValue', value)
        }
    },
}
</script>
<template>
    <div class="content-container">
        <div style="height: 1000px">
            <h1>Home</h1>
            <button @click="toggleChannel">Toggle channel</button>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        toggleChannel() {
            console.log('emit');
            this.$emit('channelToggled');
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
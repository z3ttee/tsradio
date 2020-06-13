<template>
    <h1>Header</h1>
</template>

<script>
export default {
    created(){
        window.addEventListener('scroll', this.handlePageScroll);
    },
    methods: {
        handlePageScroll(event) {
            if(window.scrollY >= 100) {
                // Set header background
            } else {
                
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    
</style>
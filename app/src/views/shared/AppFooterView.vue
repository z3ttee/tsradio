<template>
    <div class="footer">
        <div class="content-container">
            <p>&copy; {{ new Date().getFullYear() }} TSRadio | Developed with <span>❤</span> by <a href="https://github.com/z3ttee" target="_blank">z3ttee</a> | Powered by <a href="https://easternexploration.de" target="_blank">EasternExploration</a></p>
        </div>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.footer {
    padding: $boxPad 0;
    text-align: center;
    font-size: 0.85em;
    

    p {
        font-weight: 400;
        color: $colorWhite;
        opacity: 0.7;
    }
}
</style>
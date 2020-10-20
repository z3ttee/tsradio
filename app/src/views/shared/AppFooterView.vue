<template>
    <div class="footer">
        <div class="content-container">
            <ul>
                <li>&copy; {{ new Date().getFullYear() }} TSRadio</li>
                <li>Developed with <span>❤</span> by <a href="https://github.com/z3ttee" target="_blank">z3ttee</a></li>
                <li>Powered by <a href="https://easternexploration.de" target="_blank">EasternExploration</a></li>
            </ul>
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
    
    ul {
        display: block;
        width: 100%;
        padding: 0;
        list-style: none;

        li {
            display: inline-block;
            font-weight: 400;
            color: $colorWhite;
            opacity: 0.7;
            padding: 0 0.5em;
            border-right: 1px solid rgba($color: $colorWhite, $alpha: 0.6);
            border-left: 1px solid rgba($color: $colorWhite, $alpha: 0.6);

            &:last-of-type {
                padding-right: 0;
                border-right: none;
            }
            &:first-of-type {
                padding-left: 0;
                border-left: none;
            }
        }
    }
}

@media screen and (max-width: 640px) {
    .footer {
        padding-bottom: 5em;

        ul {
            li {
                display: block;
                border: none;
                padding: 0;
            }
        }
    }
}
</style>
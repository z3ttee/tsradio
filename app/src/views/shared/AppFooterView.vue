<template>
    <div class="footer-wrapper">
        <div class="content-container">
            <ul>
                <li>&copy; {{ new Date().getFullYear() }} TSAllianceEU</li>
                <li><a href="https://easternexploration.de/?page_id=107" rel="noreferrer" target="_blank">Impressum</a></li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.footer-wrapper {
    display: block;
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 100;
    padding: $boxPad;
    text-align: center;

    ul {
        list-style: none;
        padding: 0;

        li {
            opacity: 0.8;
            color: $colorPrimary;
            display: inline-block;
            padding: 0 $boxPad;
            font-weight: 700;
            font-size: 0.8em;
            border-right: 2px solid $colorPrimary;

            &:last-of-type {
                border-right: none;
            }
        }

        a {
            text-decoration: none ;
            color: inherit;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

@media screen and (max-width: 850px) {
    
}
</style>
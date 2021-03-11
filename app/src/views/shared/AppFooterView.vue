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
    width: 100%;
    padding: $boxPad;
    text-align: center;
    background-color: $colorPrimary;

    ul {
        list-style: none;
        padding: 0;

        li {
            opacity: 0.8;
            color: $colorWhite;
            display: inline-block;
            padding: 0 $boxPad;
            font-weight: 600;
            font-size: 0.8em;
            border-right: 2px solid rgba($color: $colorWhite, $alpha: 0.1);

            &:last-of-type {
                border-right: none;
            }
        }

        a {
            text-decoration: none ;
            color: inherit;
        }
    }
}

@media screen and (max-width: 850px) {
    
}
</style>
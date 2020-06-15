<template>
    <div class="content-container">
        <div class="tsr_table">
            <div class="tsr_col">
                <div class="tsr_box">
                    <h2>404 - Not Found</h2>
                    <p>Sieht so aus, als könnte dein gewünschtes Ergebnis nicht gefunden werden. Hier sind ein paar Links, um dich wieder auf den richtigen Pfad zu führen:</p>
                </div>
                <ul>
                    <router-link tag="li" to="/"><a class="tsr_actionbox large">Zur Startseite</a></router-link>
                    <router-link tag="li" to="/webinterface"><a class="tsr_actionbox large">Zum Webinterface</a></router-link>
                </ul>
            </div>
            <div class="tsr_col tsr_animated_col">
                <lottie-player :src="animationData" :options="{ autoplay: true, loop: true }"></lottie-player>
            </div>
        </div>
        
        
    </div>
</template>

<script>
import Animation404 from '@/assets/animated/404.json';

export default {
    data() {
        return {
            animationData: Animation404
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_box {
        background-color: $colorPlaceholder;
        padding: 1.5em 2em;
        border-radius: $borderRadSmall;
        box-shadow: $shadowSpread;
    }

    .tsr_table {
        display: table;
        width: 100%;
    }

    .tsr_col {
        display: table-cell;
        width: 50%;
        vertical-align: top;
        color: $colorWhite;
    }

    ul {
        margin: 2em 0em;
        margin-bottom: 0em;
        padding: 0;
        list-style: none;

        li {
            display: inline;
            padding-right: 1em;
            color: $colorAccent;

            a {
                text-decoration: none;
                color: inherit;
                font-family: inherit;
                letter-spacing: inherit;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
</style>
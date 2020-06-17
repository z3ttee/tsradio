<template>
    <div class="content-container">
        <div class="tsr_layout_table">
            <div class="tsr_col leftToDown">
                <div class="tsr_box">
                    <h2>404 - Not Found</h2>
                    <p>Sieht so aus, als könnte dein gewünschtes Ergebnis nicht gefunden werden. Hier sind ein paar Links, um dich wieder auf den richtigen Pfad zu führen:</p>
                </div>
                <ul>
                    <router-link tag="li" to="/"><a class="tsr_actionbox large ripple">Zur Startseite</a></router-link>
                    <router-link tag="li" to="/webinterface"><a class="tsr_actionbox large">Zum Webinterface</a></router-link>
                </ul>
            </div>
            <div class="tsr_col tsr_animated_col rightToUp">
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
<template>
    <div :class="{ 'splash-screen': true, 'hide': $store.state.appIsReady }">
        <div class="loading-container">
            <div class="content-container">
                <div v-if="!show503">
                    <img src="@/assets/images/branding/ts_logo_svg.svg" alt="">
                    <v-lottie-player class="animator" width="24px" height="24px" loop autoplay :animationData="loaderData"></v-lottie-player>
                </div>
                <div v-else>
                    <app-messagebox>
                        <template #title>Da ist etwas schief gelaufen!</template>
                        <template #subtitle>Whooops!</template>
                        <template #content>
                            <p>Es sieht so aus, als wäre der Service zurzeit nicht erreichbar! Bitte versuch' es später nochmal oder wende dich an einen Administrator.</p>
                            <br>
                            <app-button class="btn btn-primary btn-m" @click="reloadPage">Seite neuladen</app-button>
                        </template>
                    </app-messagebox>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import errorData from '@/assets/animated/error404.json'
import loaderData from '@/assets/animated/primary_loader_light.json'

export default {
    data() {
        return {
            loaderData,
            errorData,
            show503: false
        }
    },
    methods: {
        reloadPage() {
            document.location.reload(true)
        }
    },
    mounted() {
        setTimeout(async () => {
            let jwtValid = await this.$user.loginWithJWT()
            
            if(jwtValid.status == 200) {
                let result = await this.$user.setupUser()
                console.log("User setup: ", result)

                if(this.$route.name == 'login') this.$router.push({name: 'home'})
                this.$store.state.appIsReady = true
            } else if(jwtValid.status == 503) { 
                this.show503 = true
            } else {
                this.$router.push({name: 'login'})
                this.$store.state.appIsReady = true
            }

            
        }, 300)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.splash-screen {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;

    opacity: 1;
    width: 100%;
    height: 100%;

    background: linear-gradient(114deg, $colorPrimaryDarker, $colorPlaceholder);
    background-size: 200% 200%;
    animation: splashGradientAnim 5s ease infinite;
    transition: all $animSpeedLong*1s $cubicNorm;

    pointer-events: all;

    &.hide {
        transform: scale(0.9);
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
    }
}

.loading-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%,-50%);
    text-align: center;

    img {
        display: block;
        height: 45px;
        width: 45px;
    }

    .animator {
        margin-top: 0.5em;
        vertical-align: middle;
    }
}

@keyframes splashGradientAnim {
    0%{background-position:0% 44%}
    50%{background-position:100% 57%}
    100%{background-position:0% 44%}
}
</style>
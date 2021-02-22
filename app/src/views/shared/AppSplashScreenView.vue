<template>
    <div class="app-loader" v-if="!$store.state.app.appIsReady">
        <div class="app-loader-wrapper">
            <img class="icon icon-l" src="@/assets/images/branding/ts_logo.svg">
            
            <hr class="half">
            <p><span><app-loader class="inline"></app-loader></span> {{ getRandomMessage() }}</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            hints: [
                "CAS wird aufgeladen...",
                "Kalkuliere Matratzen...",
                "Franklin wird geröstet...",
                "Suche Reux-Mems..."
            ]
        }
    },
    methods: {
        getRandomMessage() {
            let messages = this.hints
            let random = Math.round(Math.random() * (messages.length-1))
            return messages[random]
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.app-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 10000000;
    background-color: $colorPrimaryDark;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-items: center;
}
.app-loader-wrapper {
    display: inline-block;
    width: 300px;
    text-align: center;
    img {
        margin-bottom: 1em;
    }
    p {
        font-size: 0.9em;
        font-weight: 500;
        span {
            margin-right: 0.5em;
        }
    }
}
</style>
<template>
    <div class="app-loader">
        <div class="app-loader-wrapper">
            <img class="icon icon-l" src="@/assets/images/branding/ts_logo.svg">

            <div class="message-box">
                <span><app-loader class="inline"></app-loader></span> {{ currentRandomMessage }}
            </div>

            <app-info-box class="message" v-if="showWarning">
                Es sieht so aus, als wäre eine Verbindung zum Service derzeit nicht möglich. Sobald eine Verbindung aufgebaut wurde, wirst du weitergeleitet.
            </app-info-box>
        </div>
    </div>
</template>

<script>
import AppInfoBox from '@/components/message/AppInfoBox.vue'

export default {
    data() {
        return {
            hints: [
                "CAS wird aufgeladen...",
                "Kalkuliere Matratzen...",
                "Franklin wird geröstet...",
                "Suche Reux-Mems...",
                "Drehverfahren nach Dustin Schällert anwenden...",
                "Daten verbraucht. Beende Verbindung",
                "Hirn wird verdreht...",
                "Dreherin wendet Drehmomentschlüssel an..."
            ],
            showWarning: false,
            timeout: undefined,
            interval: undefined,
            currentRandomMessage: undefined
        }
    },
    components: {
        AppInfoBox
    },
    methods: {
        getRandomMessage() {
            let messages = this.hints
            let random

            do {
                random = Math.round(Math.random() * (messages.length-1))
            } while(messages[random] == this.currentRandomMessage)

            return messages[random]
        }
    },
    mounted() {
        this.currentRandomMessage = this.getRandomMessage()
        this.timeout = setTimeout(() => {
            this.showWarning = true

            if(process.env.NODE_ENV == "development") {
                this.$store.state.app.isSocketReady = true
            }
        }, 6000)
        this.interval = setInterval(() => {
            this.currentRandomMessage = this.getRandomMessage()
        }, 5000)
    },
    unmounted() {
        clearTimeout(this.timeout)
        clearInterval(this.interval)
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.app-loader {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10000000000;
    background-color: $colorPrimaryDark;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-items: center;
}
.app-loader-wrapper {
    display: inline-block;
    width: 400px;
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

.message-box {
    span {
        margin-right: 0.5em;
    }
}

@media screen and (max-width: 400px) {
    .app-loader-wrapper {
        width: 100% !important;
        padding: $windowPad;

    }
}
</style>
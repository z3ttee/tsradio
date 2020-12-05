<template>
    <div class="playerbar-wrapper">
        <div class="content-container playerbar-container">
            <div class="player-col player-details">
                <h6>{{ selectedChannel.title }}</h6>
                <h4>{{ selectedChannel.info.title }} <span> {{ selectedChannel.info.artist }}</span></h4>
            </div>
            <div class="player-col player-controls">
                <button class="btn btn-icon btn-m btn-noscale" @click="paused = !paused">
                    <transition name="animation_item_scale" mode="out-in">
                        <img src="@/assets/images/icons/pause.svg" v-if="!paused">
                        <img src="@/assets/images/icons/play.svg" v-else>
                    </transition>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            paused: false,
        }
    },
    computed: {
        selectedChannel() {
            return this.$store.state.currentChannel
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.playerbar-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: $gradientBoxDark;
    height: 80px;
    border-top: 2px solid $colorPlaceholder;
    box-shadow: $shadowHeavy;
}
.playerbar-container {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 100%;

    .player-col {
        width: 100%;
        
        &:first-of-type {
            padding-right: 3em;
        }
        &:last-of-type {
            text-align: right;
            width: 100px;
        }
    }
}

.player-details {
    h6 {
        color: $colorAccent;
        line-height: 2em;
        letter-spacing: 1px;
    }

    h4 {
        font-weight: 600;
        letter-spacing: 0;
        line-height: 1em;

        span {
            font-weight: 500;
            font-size: 0.7em;
            vertical-align: middle;
            letter-spacing: 0.3px;
            line-height: 1.5em;
            opacity: 0.3;
            margin-left: 0.5em;
        }
    }
}

@media screen and (max-width: 950px) {
    .playerbar-wrapper {
        height: 70px;
    }
}
@media screen and (max-width: 640px) {
    .playerbar-wrapper {
        height: 60px;
    }
}

</style>
<template>
    <div class="list-item-covered-wrapper">
        <div :id="itemID+'content'" class="list-item-covered">
            <div :id="itemID+'cover'" class="list-item-col list-item-cover"></div>
            <div :id="itemID+'info'" class="list-item-col list-item-content channel-info">
                <h4 :id="itemID+'title'">Channel #1</h4>
                <div>
                    <p :id="itemID+'song'">Das ist ein Lied Das ist ein LiedDas ist ein LiedDas ist ein LiedDas ist ein Lied</p>
                    <span :id="itemID+'artist'">Das ist ein KünstlerDas ist ein KünstlerDas ist ein KünstlerDas ist ein KünstlerDas ist ein KünstlerDas ist ein Künstler</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import clamp from 'clamp-js'

export default {
    data() {
        return {
            itemID: this.makeid(6),
            observer: undefined
        }
    },
    mounted() {
        this.observer = new ResizeObserver(() => {
            clamp(document.getElementById(this.itemID+'song'), {clamp: 0,useNativeClamp: true, animate: true})
            clamp(document.getElementById(this.itemID+'song'), {clamp: 1,useNativeClamp: true, animate: true})
            clamp(document.getElementById(this.itemID+'artist'), {clamp: 0,useNativeClamp: true, animate: true})
            clamp(document.getElementById(this.itemID+'artist'), {clamp: 1,useNativeClamp: true, animate: true})
        })

        this.observer.observe(document.getElementById(this.itemID+'content'))
    },
    unmounted() {
        this.observer.unobserve(document.getElementById(this.itemID+'content'))
   }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/lists.scss';

.channel-info {
    h4,div {
        font-size: 1.2em;
        
        letter-spacing: 0.4px;
        line-height: 1.2em;
        height: 58px;
    }

    h4 {
        text-transform: uppercase;
        display: block;
        padding-top: 0.5em;
        margin: 0;
        font-size: 1em;
        line-height: 1.5em;
        font-weight: 800;

        background: linear-gradient($colorAccent, $colorPrimaryDark);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    div {
        color: $colorWhite;

        p {
            font-weight: 700;
        }

        span {
            display: block;
            font-weight: 400;
            font-size: 0.8em;
            letter-spacing: 0px;
            opacity: 0.7;
        }
    }
}

@media screen and (max-width: 1300px) {
    .channel-info {
        h4,div {
            font-size: 1.2em;
            height: 48px;
        }
    }
}
@media screen and (max-width: 950px) {
    .channel-info {
        h4,div {
            font-size: 1.35em;
            height: 40px;
        }
    }
}
</style>
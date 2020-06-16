<template>
    <div class="tsr_header" id="tsr_header">
        <div class="content-container">
            <img src="/assets/images/branding/ts_radio_banner.svg">

            <ul>
                <div class="activeIndicator"></div>
                <router-link tag="li" to="/"><a>Channels</a></router-link>
                <router-link tag="li" to="/webinterface/"><a>Webinterface</a></router-link>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    created(){
        window.addEventListener('scroll', this.handlePageScroll);
    },
    methods: {
        handlePageScroll() {
            if(window.scrollY >= 10) {
                document.getElementById('tsr_header').classList.add('scrolling');
            } else {
                document.getElementById('tsr_header').classList.remove('scrolling');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_header {
        position: fixed;
        z-index: 1000;
        width: 100%;
        color: $colorWhite;
        padding: 2em 0em;
        transition: all $animSpeedShort*1s ease;

        .content-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            align-content: center;
        }

        img {
            height: 64px;
        }

        ul {
            position: relative;
            list-style: none;
            padding: 0;

            li {
                display: inline;
                padding: 0em 1em;
                opacity: 0.9;
            }

            .activeIndicator {
                position: absolute;
                bottom: -2px;
                height: 4px;
                width: 2em;
                border-top-left-radius: 1em;
                border-top-right-radius: 1em;
                background-color: $colorAccent;
            }
        }

        &.scrolling {
            background-color: $colorPrimary;
            padding-top: 1em;
            padding-bottom: 1em;

            img {
                height: 50px;
            }
        }
    }

    a {
        color: inherit;
        text-decoration: none;
    }
</style>
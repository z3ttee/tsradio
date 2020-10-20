<template>
    <div class="list-item-covered-wrapper">
        <div class="list-item-covered">
            <div class="list-item-col list-item-cover"></div>
            <div class="list-item-col list-item-content channel-info">
                <h4>Channel #1</h4>
                <p>
                    Das ist ein Lied 
                    <span>Das ist ein Künstler</span>
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/lists.scss';

.channel-info {
    
    h4,p {
        font-size: 1.2em;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        line-height: 1.1em;
        height: 50px;
    }

    h4 {
        display: block;
        padding-top: 0.5em;
        margin: 0;
        font-size: 1em;
        line-height: 1.5em;

        background: linear-gradient($colorAccent, $colorPrimaryDark);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    p {
        span {
            display: block;
            font-weight: 400;
            font-size: 0.8em;
            letter-spacing: 0px;
            opacity: 0.7;
        }
    }
}

@media screen and (max-width: 950px) {
    .channel-info {
        h4,p {
            font-size: 1.3em;
            height: 42px;
        }
        h4 {
            background: linear-gradient($colorAccent, $colorPrimaryDark);
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
}
</style>
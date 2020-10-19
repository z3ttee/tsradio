<template>
    <div class="content-wrapper">
        <app-announcement-box-comp>
            <h2>TSRadio >> NEXT</h2>
            <p>TSRadio ist zurück! Mit neuem Design und der besten Musik! Genieße ab jetzt die beste Musik der letzten Dekaden. <br> Aber beachte: Die Seite ist noch in der BETA-Phase!</p>
        </app-announcement-box-comp>

        <section>
            <h3>Hervorgehobene Channels</h3>
            <div class="channel-grid">
                <div class="channel-item-wrapper">
                    <div class="item-col channel-cover">
                        
                    </div>
                    <div class="item-col channel-info">
                        <h4>Channel #1</h4>
                        <p>
                            Das ist ein Lied 
                            <span>Das ist ein Künstler</span>
                        </p>
                    </div>
                </div>
                <div class="channel-item-wrapper">
                    <div class="item-col channel-cover">
                        
                    </div>
                    <div class="item-col channel-info">
                        <h4>Channel #1</h4>
                        <p>
                            Das ist ein Lied 
                            <span>Das ist ein Künstler</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        <section>
            <h3>Hervorgehobene Channels</h3>
            <div class="channel-grid">
                <div class="channel-item-wrapper">
                    <div class="item-col channel-cover">
                        
                    </div>
                    <div class="item-col channel-info">
                        <h4>Channel #1</h4>
                        <p>
                            Das ist ein Lied 
                            <span>Das ist ein Künstler</span>
                        </p>
                    </div>
                </div>
                <div class="channel-item-wrapper">
                    <div class="item-col channel-cover">
                        
                    </div>
                    <div class="item-col channel-info">
                        <h4>Channel #1</h4>
                        <p>
                            Das ist ein Lied 
                            <span>Das ist ein Künstler</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import AppAnnouncementBoxComp from '@/components/message/AppAnnouncementBoxComp.vue'

export default {
    components: {
        AppAnnouncementBoxComp
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.channel-grid {
    display: grid;
    gap: 1em;
    grid-template-columns: 50% 50%;

    .channel-item-wrapper {
        display: table;
        width: 100%;
        
        overflow: hidden;
        vertical-align: top;
        box-shadow: $shadowNormal;
        background-color: rgba($color: $colorPlaceholder, $alpha: 0.8);
        border-radius: $borderRadSmall;

        .item-col {
            display: table-cell;

            &.channel-cover {
                padding: 0;
                width: 100px;
                height: 100px;
                background-color: $colorPrimary;

                border-top-right-radius: $borderRadSmall;
                border-bottom-right-radius: $borderRadSmall;
            }

            &.channel-info {
                padding: 0 1em;
                

                h4,p {
                    font-size: 1.2em;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.7px;
                    line-height: 1.1em;
                }

                h4 {
                    display: block;
                    height: 50px;
                    padding-top: 0.5em;
                    margin: 0;
                    font-size: 1em;
                    line-height: 1.5em;

                    background: linear-gradient($colorAccent, $colorPrimaryDark);
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                p {
                    height: 50px;

                    span {
                        display: block;
                        font-weight: 400;
                        font-size: 0.8em;
                        letter-spacing: 0px;
                        opacity: 0.7;
                    }
                }
            }
        }
    }
}

/*
[]=========== Media Query ===========[]
*/
@media screen and (max-width: 1300px) {
    
}

@media screen and (max-width: 950px) {
    .channel-grid {
        grid-template-columns: 100%;
    }
}
</style>
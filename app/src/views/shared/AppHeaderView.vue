<template>
    <div class="header">
        <div class="content-container">
            <div class="header-bar-section">
                <button class="btn btn-icon btn-l btn-inline"><img src="@/assets/images/icons/menu.svg"></button>
            </div>

            <div class="header-bar-section">
                <img id="desktop-banner" src="@/assets/images/branding/ts_radio_banner.svg" alt="" srcset="">
            </div>

            <div class="header-bar-section">
                <button class="btn btn-primary btn-m btn-inline"><img src="@/assets/images/icons/key.svg"> Anmelden</button>
                <button class="btn btn-icon btn-m btn-inline"><img src="" alt=""></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.header {
    padding: $boxPad 0;

    .header-bar-section {
        vertical-align: middle;
        display: inline-block;
        width: 33%;
        text-align: center;

        img#desktop-banner {
            height: 50px;
        }

        &:first-of-type {
            text-align: left;
        }
        &:last-of-type {
            text-align: right;
        }
    }
}
</style>
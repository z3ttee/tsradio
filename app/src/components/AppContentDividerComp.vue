<template>
    <div class="divider-container">
        <div class="divider"></div>
        <img src="@/assets/images/branding/ts_logo.svg">
        <div class="divider"></div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.divider-container {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    
    padding: $boxPad 0;

    img {
        display: inline-block;
        width: 28px;
        height: 28px;
        vertical-align: middle;
        margin: 0 1em;
    }

    div.divider {
        display: inline-block;
        width: 150px;
        height: 3px;
        border-radius: 4px;
        background-color: $colorPlaceholder;
        opacity: 0.5;
    }
}
</style>
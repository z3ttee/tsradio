<template>
    <div class="tsr_list_item_wrapper">
        <div class="tsr_list_item item_inline" @click="select">
            <div class="tsr_list_item_col">
                <div class="tsr_list_cover"></div>
            </div>
            <div class="tsr_list_item_col tsr_list_item_content">
                <p class="name" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.name"></p>
                <div class="tsr_info">
                    <p class="title" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.title"></p>
                    <p class="artist" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+channel.info.artist"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['channel'],
    methods: {
        select(){
            this.$store.state.currentChannel = this.channel;
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_list_item {
        $height: 100px;

        display: table;
        table-layout: fixed;

        margin: 0.5em 0em;
        width: 100%;

        background-color: $colorPrimary;
        box-shadow: $shadowNormal;
        border-radius: $borderRadMedium;
        overflow: hidden;

        &:hover {
            cursor: pointer;
        }

        .tsr_list_item_col {
            display: table-cell;
            width: 100%;
            overflow: hidden;
            vertical-align: middle;

            &:first-of-type {
                width: $height;
                height: $height;
            }
        }

        .tsr_list_cover {
            width: $height;
            height: $height;
            border-radius: $borderRadMedium;
            box-shadow: $shadowSpread;
            background-color: $colorPlaceholder;
        }

        .tsr_list_item_content {
            position: relative;
            overflow: hidden;

            &::before, &::after {
                display: inline-block;
                width: 2em;
                position: absolute;
                top: 0;
                bottom: 0;
                background-image: linear-gradient(-90deg, rgba($colorPrimary, 0) 0%, rgba($colorPrimary, 1) 100%);
                z-index: 1000;
                content: "";
            }
            &::before {
                left: 0;
            }
            &::after {
                right: 0;
                width: 4em;
                content: "";
                background-image: linear-gradient(90deg, rgba($colorPrimary, 0) 0%, rgba($colorPrimary, 1) 50%);
            }
        }
    }

    p {
        line-height: initial;
        margin: initial;
        font-size: 1.2em;
        color: $colorWhite;

        white-space: nowrap;
        text-overflow: clip;

        &.name {
            color: $colorAccent;
            margin-bottom: 0.15em;
        }
        &.artist {
            font-family: 'BebasKai';
            font-weight: 400;
            letter-spacing: 1.5px;
            opacity: 0.7;
            font-size: 1em;
        }
    }
</style>
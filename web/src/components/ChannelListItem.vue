<template>
    <div class="tsr_list_item item_inline" @click="select">
        <div class="tsr_list_item_col">
            <div class="tsr_list_cover"></div>
        </div>
        <div class="tsr_list_item_col">
            <p v-html="channel.name"></p>
            <div class="tsr_info">
                <p v-html="channel.info.title"></p>
                <p v-html="channel.info.artist"></p>
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
        background-color: $colorPrimary;
        box-shadow: $shadowNormal;
        border-radius: $borderRadSmall;
        overflow: hidden;

        .tsr_list_item_col {
            display: table-cell;
            vertical-align: middle;

            &:first-of-type {
                width: 64px;
            }
            
        }

        .tsr_list_cover {
            width: 64px;
            height: 64px;
            border-radius: $borderRadSmall;
            box-shadow: $shadowNormal;
        }

        &.item_inline {
            display: inline-flex;
        }
    }
</style>
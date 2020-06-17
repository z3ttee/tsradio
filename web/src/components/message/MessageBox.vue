<template>
    <div class="tsr_box message_box">
        <!--<div class="message_box_col">
            <lottie-player class="loader" :src="bannerData" :options="{ autoplay: true, loop: true }"></lottie-player>
        </div>-->
        <div class="message_box_col">
            <h4 v-html="message.title"></h4>
            <p v-html="message.content"></p>
        </div>
    </div>
</template>

<script>
export default {
    props: ['message', 'bannerData']
}
</script>

<style lang="scss" scoped>
    .message_box {
        padding: 1em 1.5em;
    }
    p {
        margin: 0;
    }
</style>
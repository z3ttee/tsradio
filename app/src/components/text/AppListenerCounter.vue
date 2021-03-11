<template>
    <div class="listener-counter">
        <span>{{ listeners || 0 }}</span>
        <img src="@/assets/icons/headphones.svg">
    </div>
</template>

<script>
export default {
    props: {
        listeners: Number
    }
}
</script>

<style lang="scss" scoped>

.listener-counter {
    display: inline-block;
    text-align: center;

    font-size: 0.8em;

    img {
        margin-left: 0.5em;
        height: 1em;
        vertical-align: middle;
    }
}

</style>
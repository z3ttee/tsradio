<template>
    <div class="tsr_msg error">
        <div class="msg_icon"><img src="/assets/images/icons/close.svg"></div>
        <div class="msg_content">
            <p>{{ error }}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: ['error']
}
</script>
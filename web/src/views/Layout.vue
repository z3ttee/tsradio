<template>
    <div>
        <tsr-header></tsr-header>
        <tsr-playerbar></tsr-playerbar>
        <router-view></router-view>
    </div>
</template>

<script>
import Header from './shared/Header.vue';
import PlayerBar from './shared/PlayerBar.vue';

export default {
    components: {
        tsrHeader: Header,
        tsrPlayerbar: PlayerBar
    }
}
</script>
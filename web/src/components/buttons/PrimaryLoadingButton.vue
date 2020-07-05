<template>
    <button :id="id" class="btn btn-primary btn-large" @click="clicked">
        <span key="btn-text">{{ text }}</span> 
        <primary-loader key="btn-loader" classes="btn-loader" :settings="{ autoplay: true, loop: true}" :light="true" v-show="loading"></primary-loader>
    </button>
</template>

<script>
import PrimaryLoader from '@/components/loader/PrimaryLoader.vue';

export default {
    props: ["text"],
    data() {
        return {
            id: "loadingBtn"+Math.floor(Math.random()*1000),
            loading: false
        }
    },
    components: {
        PrimaryLoader
    },
    methods: {
        clicked(event) {
            this.loading = true
            document.getElementById(this.id).disabled = true;
            this.$emit('click', event, this.done);
        },
        done() {
            this.loading = false
            document.getElementById(this.id).disabled = false;
        }
    }
}
</script>
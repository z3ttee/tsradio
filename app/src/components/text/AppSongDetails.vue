<template>
    <div :id="itemId" class="song-details">
        <p :id="itemId + 'title'" class="section-title" v-if="hasSectionTitle" :style="'color: ' + getAccentColorHex"><slot name="sectionTitle"></slot></p>
        <p :id="itemId + 'song'" class="song-title"><slot name="songTitle"></slot></p>
        <p :id="itemId + 'artist'" class="song-artist"><slot name="songArtist"></slot></p>
    </div>
</template>

<script>
import clamp from 'clamp-js'

export default {
    data() {
        return {
            itemId: this.generateId(6),
            resizeTimeout: undefined,
            observer: undefined
        }
    },
    props: {
        accentColorHex: String
    },
    computed: {
        hasSectionTitle() {
            return !!this.$slots.sectionTitle
        },
        getAccentColorHex() {
            return this.accentColorHex || ""
        }
    },
    methods: {

    },
    mounted() {
        setTimeout(() => {
            this.observer = new ResizeObserver(() => {
                try {
                    clamp(document.getElementById(this.itemId + 'artist'), {clamp: 1, useNativeClamp: true, animate: true})
                    clamp(document.getElementById(this.itemId + 'song'), {clamp: 1, useNativeClamp: true, animate: true})
                    clamp(document.getElementById(this.itemId + 'title'), {clamp: 1, useNativeClamp: true, animate: true})
                } catch (error) { 
                    /* Do nothing */ 
                    this.observer = undefined
                }
            })
            if(document.getElementById(this.itemId)) {
                this.observer.observe(document.getElementById(this.itemId))
            }
            
        }, 100)
    },
    unmounted() {
        try {
            if(document.getElementById(this.itemId)) {
                this.observer.unobserve(document.getElementById(this.itemId))
            }
        } catch (error) { /* Do nothing */ }
    }
}
</script>

<style lang="scss" scoped>
.song-details {
    position: relative;
    display: inline-block;
    font-size: 1em;
    line-height: 1.3em;

    p {
        font-size: inherit;
        font-family: 'Poppins', 'Whitney', sans-serif;
    }

    .section-title {
        font-family: 'Whitney';
        font-size: 0.9em;
        margin-bottom: 0.3em;
    }

    .song-title {
        font-size: 1.05em;
        font-weight: 700;
        letter-spacing: 0.3px;
    }

    .song-artist {
        font-weight: 500;
        font-size: 0.8em;
        opacity: 0.6;
    }
}
</style>
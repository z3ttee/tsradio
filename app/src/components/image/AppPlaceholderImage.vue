<template>
    <div :class="{'image-placeholder': true, 'state-blank': showBlank}" :style="'background-image: url(' + downloadedSrcUrl + ');'"></div>
</template>

<script>
export default {
    data() {
        return {
            imageItemId: this.generateId(6),
            downloadedSrcUrl: '',
            showBlank: false,
            cache: this.generateId(6)
        }
    },
    props: {
        src: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        cacheKey: {
            type: String
        }
    },
    methods: {
        downloadImage() {
            let downloadImage = new Image()

            downloadImage.onload = (event) => {
                this.showBlank = false
                this.downloadedSrcUrl = event?.path[0]?.src
            }

            downloadImage.onerror = () => {
                if(!this.placeholder) this.showBlank = true
            }

            if(this.src.search("undefined") == -1) {
                downloadImage.src = this.src + "?key=" + this.cache
            } else {
                this.showBlank = true
            }
            
        }
    },
    watch: {
        src() {
            this.downloadImage()
        },
        placeholder(val) {
            this.showBlank = !val
        },
        cacheKey(val) {
            this.cache = val
            this.downloadImage()
        }
    },
    mounted() {
        if(this.cacheKey) {
            this.cache = this.cacheKey
        }

        if(!this.placeholder) {
            this.showBlank = true
        } else {
            this.downloadedSrcUrl = this.placeholder
        }

        this.downloadImage()
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.image-placeholder {
    position: relative;
    display: inline-block;
    vertical-align: middle;

    background: $colorPlaceholder;
    background-attachment: scroll;
    background-position: center;
    background-size: cover;
    transition: all $animSpeedNormal*1s $cubicNorm;

    &.state-blank {
        background-color: $colorPlaceholder;
    }
}
</style>
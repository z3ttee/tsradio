<template>
    <div :class="{'image-placeholder': true, 'state-blank': showBlank}" :style="'background-image: url(' + downloadedSrcUrl + ');'"></div>
</template>

<script>
import * as coverImagePlaceholder from "@/assets/images/branding/ts_logo_background.png"
import * as songImagePlaceholder from "@/assets/images/branding/ts_cover_placeholder.jpeg"

export default {
    data() {
        return {
            downloadedSrcUrl: '',
            showBlank: false
        }
    },
    props: {
        resourceType: {
            type: String,
            default: "cover"
        },
        resourceKey: String,
        resourceId: String,
        timestamp: String
    },
    computed: {
        resourceUrl() {
            if(this.resourceType == "cover") {
                return this.$store.state.urls.coverBase + "/channel/" + this.resourceId
            } else if(this.resourceType == "song") {
                return this.$store.state.urls.coverBase + "/current/" + this.resourceId
            } else if(this.resourceType == "history") {
                return this.$store.state.urls.coverBase + "/history/" + this.resourceId + "/?timestamp=" + this.timestamp
            } else if(this.resourceType == "avatar") {
                return this.$store.state.urls.avatarBase + this.resourceId
            } else {
                return this.placeholderUrl || ""
            }
        },
        placeholderUrl() {
            if(this.resourceType == "avatar" || this.resourceType == "cover") {
                return coverImagePlaceholder
            } else {
                return songImagePlaceholder
            }
        }
    },
    methods: {
        downloadImage() {
            var formattedUrl = this.resourceUrl

            if(this.resourceUrl.search("undefined") == -1) {
                if(this.resourceKey && !this.timestamp) {
                    if(this.resourceUrl.search(/\?/) != -1) {
                        formattedUrl += "&key=" + this.resourceKey
                    } else {
                        formattedUrl += "?key=" + this.resourceKey
                    }
                }
            } else {
                this.showBlank = true
                return
            }

            let downloadImage = new Image()

            downloadImage.onload = () => {
                this.showBlank = false
                this.downloadedSrcUrl = formattedUrl
            }

            downloadImage.onerror = () => {
                if(!this.placeholderUrl) this.showBlank = true
            }
            
            downloadImage.src = formattedUrl
        }
    },
    watch: {
        resourceId() {
            this.downloadImage()
        },
        placeholder(val) {
            this.showBlank = !val
        },
        resourceKey() {
            this.downloadImage()
        }
    },
    mounted() {
        if(!this.placeholderUrl) {
            this.showBlank = true
        } else {
            this.downloadedSrcUrl = this.placeholderUrl
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
<template>
    <div :id="elementID" class="popup-list-wrapper" :style="'width: '+width+'px'">
        <div class="popup-list-container">
            <ul>
                <slot></slot>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        width: {
            type: Number,
            default: 300
        }
    },
    setup() {
        return { togglePopup }
    },
    data() {
        return {
            elementID: "id"+this.makeid(8),
        }
    },
    mounted() {
        let parent = document.getElementById(this.elementID).parentElement
        parent.addEventListener("mouseenter", () => this.togglePopup(this.elementID, true))
        parent.addEventListener("mouseleave", () => this.togglePopup(this.elementID, false))
    }
}

function togglePopup(elementID, show) {
    let element = document.getElementById(this.elementID)
    if(!element) return

    if(!show) {
        element.classList.remove('active')
    } else {
        element.classList.add('active')
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.popup-list-wrapper {
    position: absolute;
    top: 100%;
    right: 0;
    padding: 1em 0;
    text-align: left;

    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);

    cursor: default;
    transition: all $animSpeedNormal*1s $cubicNorm;

    &.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
}

.popup-list-container {
    background: $gradientBox;
    padding: 1em;
    border-radius: $borderRadSmall;
    box-shadow: $shadowNormal;
    border: 2px solid $colorPrimary;

    ul {
        list-style: none;
        padding: 0;

        li {
            letter-spacing: 1px;
            font-weight: 500;
            padding: 1em;
            border-radius: $borderRadSmall;

            &:hover {
                background-color: $colorPlaceholder;
                cursor: pointer;
            }

            img {
                height: 14px;
                width: 14px;
                vertical-align: middle;
                margin-right: 0.5em;
            }
        }
    }
}
</style>
<template>
    <div :class="{'sidebar-overlay': true, 'visible': sidebarOpen }" @click="containerClicked">
        <div class="sidebar-wrapper">
            <div class="sidebar-container">
                <button id="close_btn" class="btn btn-icon" @click="toggleSidebar"><img src="@/assets/images/icons/close.svg"></button>
                
                <img id="sidebar_logo" src="@/assets/images/branding/ts_logo.svg">
                <hr>

                <ul>
                    <li>Startseite</li>
                    <li>Kategorien</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import sidebarEventListener from '@/events/SidebarEventListener.js'

export default {
    data() {
        return {
            sidebarOpen: false
        }
    },
    methods: {
        toggleSidebar() {
            // TODO
            this.sidebarOpen = !this.sidebarOpen
        },
        containerClicked(event) {
            if(event.target.classList.contains('sidebar-overlay')) {
                this.toggleSidebar()
            }
        }
    },
    mounted() {
        sidebarEventListener.on('toggle', this.toggleSidebar)
    }, 
    unmounted() {
        sidebarEventListener.off('toggle', this.toggleSidebar)
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 10000;
    background-color: rgba($color: black, $alpha: 0.6);
    pointer-events: none;
    overflow: hidden;
    visibility: hidden;
    opacity: 0;
    transition: all $animSpeedFast*1s $cubicNorm;

    &.visible {
        visibility: visible;
        pointer-events: all;
        opacity: 1;

        .sidebar-wrapper {
            opacity: 1;
            left: $windowPad;
            transition-delay: none;
        }
    }
}

.sidebar-wrapper {
    position: absolute;
    top: $windowPad;

    left: 0;
    opacity: 0;

    bottom: $windowPad;
    background-color: rgba($color: $colorPrimaryDarker, $alpha: 1);
    padding: 1em;
    width: 380px;
    border-radius: $borderRadSmall;
    overflow-x: hidden;
    overflow-y: auto;
    box-shadow: $shadowNormal;
    transition: all $animSpeedNormal*1s $cubicNorm;

    .sidebar-container {
        min-height: 100%;
        padding: 1em;
        border: 3px solid $colorPrimaryDark;
        border-radius: $borderRadSmall;

        img#sidebar_logo {
            display: block;
            width: 32px;
        }

        button#close_btn {
            position: absolute;
            top: $windowPad;
            right: $windowPad;
            opacity: 0.5;
        }

        hr {
            margin: 2.5em 0;
        }

        ul {
            display: block;
            padding: 0;
            list-style: none;

            li {
                display: block;
                padding: 0.5em 1em;
                font-weight: 600;
                font-size: 1.2em;
                transition: all $animSpeedFast*1s $cubicNorm;
                text-align: center;
                border-radius: $borderRadTiny;
                opacity: 0.5;

                &:hover {
                    background-color: $colorPrimaryDark;
                    cursor: pointer;
                    opacity: 1;
                }
            }
        }
    }
}

@supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
    .sidebar-overlay {
        backdrop-filter: blur(10px);
    }
}

@media screen and (max-width: 1300px) {
    .sidebar-wrapper {
        width: 320px;
    }
}
@media screen and (max-width: 640px) {
    .sidebar-wrapper {
        left: 0;
        right: 0;
        width: 90%;

        .sidebar-container {
            ul li {
                font-size: 1.3em;
            }
        }
    }

    .sidebar-overlay {
        &.visible {
            .sidebar-wrapper {
                left: 0;
            }
        }
    }
}
@media screen and (max-width: 480px) {
    .sidebar-wrapper {
        left: 0;
        right: 0;

        .sidebar-container {
            ul li {
                font-size: 1.3em;
            }
        }
    }
}
</style>
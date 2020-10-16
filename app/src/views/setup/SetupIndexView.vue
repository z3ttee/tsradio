<template>

    <section>
        <app-content-divider-comp></app-content-divider-comp>
        <br><br><br>
        <h3 class="capitalize">Welcome to</h3>
        <h1 class="capitalize gigantic">TS<span>Radio</span></h1>

        <div v-if="currentStep == 0">
            <p style="margin: 2em 0;">You entered the setup wizard that will guide you through the installation process. So please follow the instructions and you are ready to go!</p>
            <button class="btn btn-m btn-primary btn-inline" @click="currentStep++">Jump into the setup</button><br>
        </div>

        <div v-else>
            <br><br>
            <div class="setup-navigation">
                <button class="btn btn-primary btn-icon btn-icon-circle"><img src="@/assets/images/icons/chevron.svg"></button>
                <p>Step {{ currentStep }} of 2</p>
                <button class="btn btn-primary btn-icon btn-icon-circle"><img src="@/assets/images/icons/chevron.svg" style="transform: rotate(-180deg);"></button>
            </div>
            <hr>
            <component :is="currentComp"></component>
        </div>
    </section>
    
</template>

<script>
import AppContentDividerComp from '@/components/AppContentDividerComp.vue'
import SetupDatabaseView from '@/views/setup/SetupDatabaseView.vue'

export default {
    components: {
        AppContentDividerComp,
        SetupDatabaseView
    },
    data() {
        return {
            currentStep: 0
        }
    },
    computed: {
        currentComp() {
            switch(this.currentStep) {

                default:
                    return SetupDatabaseView
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

h1, h3 {
    line-height: 1em;
}

h1 {
    text-shadow: 0px 3px 16px rgba($color: $colorPrimaryDark, $alpha: 1);

    span {
        font-weight: inherit;
        color: $colorAccent;
    }
}

h3 {
    font-weight: 500;
}

section {
    padding: $windowPad;
}


.setup-navigation {
    position: relative;
    display: inline-block;
    width: 100%;
    text-align: center;

    button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);

        &:first-of-type {
            left: 0;
        }
        &:last-of-type {
            right: 0;
        }
    }
}

hr {
    appearance: none;
    border: none;
    display: inline-block;
    height: 3px;
    width: 100%;
    background-color: $colorPlaceholder;
    margin: 0.8em 0;
    border-radius: 4px;
}

.setup-form {
    background-color: $colorPrimaryDark;
    padding: $windowPad;
    border-radius: $borderRadSmall;
    color: $colorWhite;
}
</style>
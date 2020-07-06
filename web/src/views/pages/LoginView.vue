<template>
    <div>
        <div class="content-container">
            <div class="tsr_box" v-if="loading">
                <primary-loader classes="col loader" :settings="{ autoplay: true, loop: true}"></primary-loader>
                <p class="col">Es wird versucht dich anzumelden...</p>
            </div>

            <div v-else>
                <div class="tsr_form">
                    <div class="tsr_form_banner">
                    </div>
                    <div class="tsr_form_content">
                        <h2>Anmelden</h2>
                        <error-message :error="error" v-if="error" @click="error = undefined"></error-message>
                        <p>Dies ist eine Seite zur privaten (non-kommerzielle) Nutzung. Bevor du die Seite nutzen kannst, musst du dich mit deinen Daten anmelden.</p>
                        
                        <div class="tsr_form_group">
                            <label for="form_username">Dein Benutzername</label>
                            <input class="" type="text" name="username" id="form_username" v-model="form.username" autocomplete="false">
                        </div>
                        <div class="tsr_form_group">
                            <label for="form_password">Dein Passwort</label>
                            <input type="password" name="password" id="form_password" v-model="form.password" autocomplete="false">
                        </div>
                        <div class="tsr_form_group">
                            <p>Du bleibst automatisch für 7 Tage angemeldet</p>
                        </div>
                        <primary-loading-button text="Jetzt anmelden" @click="submit" :disabled="!form.username || !form.password"></primary-loading-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

import ErrorMessage from '@/components/message/ErrorMessage.vue';
import PrimaryLoader from '@/components/loader/PrimaryLoader.vue';
import PrimaryLoadingButton from '@/components/buttons/PrimaryLoadingButton.vue';

export default {
    components: {
        PrimaryLoader,
        PrimaryLoadingButton,
        ErrorMessage
    },
    data() {
        return {
            loading: false,
            error: undefined,
            form: {}
        }
    },
    methods: {
        submit(event, done) {
            this.error = undefined;
            setTimeout(() => {
                axios.get('member/login/', { params: this.form }).then(response => {
                    if(response.status == 200) {
                        var meta = response.data.meta;

                        if(meta.status == 200) {
                            var user = response.data.payload.user;

                            if(user.session.token) {
                                this.$store.state.user = user
                                var expiry = new Date(user.session.expiry).toString();

                                this.$cookies.set('tsr_session', user.session.token, expiry, '/', null, null, true);
                                this.$router.go(-1);
                            }
                        } else {
                            if(response.data.meta.message == "wrong credentials") {
                                this.error = "Du konntest nicht angemeldet werden, da der Benutzername nicht mit dem Passwort übereinstimmt."
                            }
                        }
                    } else {
                        this.error = "Du konntest nicht angemeldet werden, da unsere Services gerade nicht erreichbar sind."
                    }
                }).catch(error => {
                    console.log(error);
                    this.error = "Du konntest nicht angemeldet werden, da unsere Services gerade nicht erreichbar sind."
                }).finally(() => {
                    done();
                });
            }, 1000);
        }
    }
}
</script>
<style lang="scss" scoped>
    .tsr_form {
        display: table;
        width: 100%;
        min-height: 10em;
        background-color: rgba($color: $colorPrimary, $alpha: 0.8);
        box-shadow: $shadowSpread;
        border-radius: $borderRadSmall;
        overflow: hidden;

        .tsr_form_banner {
            position: relative;
            display: table-cell;
            width: 350px;
            vertical-align: top;

            background-image: url('/assets/images/background/login_banner.png');
            background-position: center;
            filter: brightness(0.5);
            box-shadow: $shadowSpread;
        }

        .tsr_form_content {
            display: table-cell;
            vertical-align: top;
            padding: 3em;

            input[type=text],input[type=password] {
                width: 100%;
            }
        }
    }

    .tsr_box {
        display: table;
        width: 100%;
        padding: 0.8em;

        .col {
            display: table-cell;
            vertical-align: middle;

            &.loader {
                width: 54px;
            }
        }

        p {
            padding-left: 0.5em;
        }
    }
    
/*
[]=========== Media Queries ===========[]
*/
@media screen and (max-width: 880px) {
    .tsr_form_banner {
        width: 200px !important;
    }
}
@media screen and (max-width: 730px) {
    .tsr_form {
        display: block;
        margin: 0 auto;
        width: 380px;
    }
    .tsr_form_banner {
        display: none !important;
    }
}
@media screen and (max-width: 480px) {
    .tsr_form {
        width: 100%;
    }
}
</style>
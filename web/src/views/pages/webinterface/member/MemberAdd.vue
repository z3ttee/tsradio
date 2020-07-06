<template>
    <div>
        <h2>Benutzer hinzufügen</h2>
        <hr class="interface large">
        <div class="tsr_box">
            <p>Du kannst hier einen neuen Benutzer anlegen. Dieser hat dann vollen Zugriff auf alle Streams innerhalb dieses Radios. Im kommenden Permissionsystem kannst du außerdem verschiedenen Nutzern mehre Rechte zuweisen.</p>
        </div>
        <hr class="interface large">
        <error-message :error="error" v-if="error"></error-message>
        <hr class="interface large" v-if="error">

        <div class="tsr_form_group centered">
            <label for="member_username">Benutzername</label>
            <input class="large" type="text" name="member_username" id="member_username" v-model="form.username">
            <ul class="tsr_form_requirements">
                <li id="requirement_1" :class="requirements[1] ? 'checked' : ''">Mindestens 3 und maximal 16 Zeichen</li>
            </ul>
        </div>
        <div class="tsr_form_group centered">
            <label for="member_password">Benutzer Passwort</label>
            <input class="large" type="password" name="member_password" id="member_password" v-model="form.password">
            <ul class="tsr_form_requirements">
                <li id="requirement_1" :class="requirements[0] ? 'checked' : ''">Mindestens 8 und maximal 16 Zeichen</li>
            </ul>
        </div>
        <div class="tsr_form_group centered">
            <primary-loading-button text="Neuen Benutzer anlegen" @click="submit" :disabled="!validated"></primary-loading-button>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import ErrorMessage from '@/components/message/ErrorMessage.vue';
import PrimaryLoadingButton from '@/components/buttons/PrimaryLoadingButton.vue';

export default {
    components: {
        PrimaryLoadingButton,
        ErrorMessage
    },
    data() {
        return {
            validated: false,
            error: undefined,
            requirements: [false, false],
            form: {}
        }
    },
    watch: {
        'form.password'(val) {
            this.requirements[0] = val.match("^.{8,16}$");
            this.validate()
        },
        'form.username'(val) {
            this.requirements[1] = val.match("^.{3,16}$");
            this.validate()
        }
    },
    methods: {
        submit(event, done) {
            setTimeout(() => {
                axios.get('member/register/?username='+this.form.username+'&password='+this.form.password).then(response => {
                    if(response.status == 200 && response.data.meta.status == 200) {
                        this.$router.go(-1);
                    } else {
                        if(response.data.meta.message == "username already exists") {
                            this.error = "Ein Benutzer mit diesem Name existiert bereits"
                        } else {
                            this.error = response.data.meta.message
                        }
                    }
                }).catch(error => {
                    this.error = "Die Services sind gerade nicht erreichbar.";
                    console.log(error);
                }).finally(done());
            }, 1000);
        },
        validate() {
            var missing = false;

            for(var requirement of this.requirements) {
                if(!requirement) {
                    missing = true;
                    break
                }
            }

            this.validated = (!missing && this.form.username && this.form.password);
        }
    }
}
</script>

<style lang="scss" scoped>
    .tsr_form_group {
        width: 480px;
    }

    hr {
        appearance: none;
        border: none;
        height: 3px;
        width: 50%;
        margin: 0 auto;
        background-color: $colorPlaceholder;
        opacity: 0.4;
        border-radius: 4px;
        margin: 1em auto;

        &.large {
            width: 100%;
        }
    }
</style>
<template>
    <section>
        <div class="login-form">
            <div class="login-col"></div>
            <div class="login-col">
                <div class="form-group">
                    <h2>Anmelden</h2>
                    <label for="input_username">Dein Benutzername</label>
                    <input type="text" name="input_username" id="input_username" v-model="$v.username.$model" @input="$v.username.$touch()">
                    <ul class="error-section">
                        <li v-for="(error, index) of $v.username.$errors" :key="index">{{ error.$message }}</li>
                    </ul>
                </div>
                <div class="form-group">
                    <label for="input_password">Dein Passwort</label>
                    <input type="password" name="input_password" id="input_password" v-model="$v.password.$model" @input="$v.password.$touch()">
                    <p class="error-message"></p>
                </div>
                <div class="form-group">
                    <app-button class="btn btn-full btn-l btn-accent" @clicked="submit">Jetzt anmelden</app-button>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { required, minLength, maxLength } from '@vuelidate/validators'

export default {
    data() {
        return {
            username: "",
            password: ""
        }
    },
    methods: {
        submit(event, done) {
            // Validate form
            this.$v.$touch()

            if(this.$v.$error) {
                done()
                return
            }

            this.$api.post('/auth/signin', { username: this.$v.username.$model, password: this.$v.password.$model }).then((result) => {
                console.log(result)
            })
            done()
        }
    },
    validations() {
        return {
            username: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(16)
            },
            password: {
                required
            }
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/forms.scss';

.login-form {
    display: table;
    width: 100%;
    min-height: 400px;
    border-radius: $borderRadSmall;
    box-shadow: $shadowLight;
    overflow: hidden;

    .login-col {
        display: table-cell;
        height: 100%;
        padding: 2em;

        &:first-of-type {
            position: relative;

            width: 30%;
            background-image: url("~@/assets/images/background/login_banner.png");
            background-position: center;
            background-attachment: scroll;
            background-repeat: no-repeat;
            background-size: cover;

            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                background-color: rgba(0, 0, 0, 0.4);
            }
        }

        &:last-of-type {
            width: 70%;
            background: $gradientBox;
        }
    }
    
}
</style>
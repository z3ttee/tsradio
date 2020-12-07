<template>
    <section>
        <div class="login-form">
            <div class="login-col"></div>
            <div class="login-col">
                <div :class="{ 'form-group': true, 'error': $v.username.$error }">
                    <h2>Anmelden</h2>

                    <app-textbox class="box-error" v-if="error">{{ error }}</app-textbox>

                    <label for="input_username">Dein Benutzername</label>
                    <input type="text" name="input_username" id="input_username" v-model="$v.username.$model" @input="$v.username.$touch()">
                    <ul class="error-section">
                        <li v-for="(error, index) of $v.username.$errors" :key="index">{{ error.$message }}</li>
                    </ul>
                </div>
                <div :class="{ 'form-group': true, 'error': $v.password.$error }">
                    <label for="input_password">Dein Passwort</label>
                    <input type="password" name="input_password" id="input_password" v-model="$v.password.$model" @input="$v.password.$touch()">
                    <ul class="error-section">
                        <li v-for="(error, index) of $v.password.$errors" :key="index">{{ error.$message }}</li>
                    </ul>
                </div>
                <div class="form-group">
                    <label for="input_remember"><input type="checkbox" name="input_remember" id="input_remember" v-model="$v.remember.$model" @input="$v.remember.$touch()"> Angemeldet bleiben?</label>
                </div>
                <div class="form-group">
                    <app-button class="btn btn-full btn-l btn-accent btn-text-center" @clicked="submit">Jetzt anmelden</app-button>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { required } from '@vuelidate/validators'

export default {
    data() {
        return {
            username: "",
            password: "",
            remember: true,
            error: undefined
        }
    },
    methods: {
        submit(event, done) {
            // Validate form
            this.$v.$touch()
            this.error = undefined
            
            if(this.$v.$error) {
                done()
                return
            }

            setTimeout(() => {
                this.$user.loginWithCredentials(this.$v.username.$model, this.$v.password.$model, this.$v.remember.$model).then((result) => {
                    if(result.status != 200) {
                        this.error = result.message
                        return
                    }

                    this.$router.push({name: 'home'})
                }).finally(() => done())
            }, 300)
        }
    },
    validations() {
        return {
            username: {
                required
            },
            password: {
                required
            },
            remember: {}
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';
@import '@/assets/scss/forms.scss';

.login-form {
    display: table;
    width: 100%;
    min-height: 450px;
    border-radius: $borderRadTiny;
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
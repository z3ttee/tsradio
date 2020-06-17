<template>
    <div>
        <!--<transition mode="out-in">-->
            <message-box :message="messages[0]"></message-box>
        <!--</transition>-->
        
        <ul v-if="messages.length > 1">
            <li v-for="i in messages.length" :key="i"></li>
        </ul>
    </div>
</template>

<script>
import MessageBox from './MessageBox.vue';

export default {
    data() {
        return {
            messages: [
                { id: '123', title: 'Beta-Information', content: 'Das Radio befindet sich noch in der Aufbauphase. Es sind also unvollständige Features und Fehler zu erwarten.'},
                { id: '1234', title: 'Das ist ein Titel', content: 'Das ist ein Test'}
            ]
        }
    },
    components: {
        MessageBox
    }
}
</script>

<style lang="scss" scoped>
    ul {
        display: block;
        list-style: none;
        padding: 0;
        text-align: center;

        li {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: $colorPlaceholder;
            margin: 0em 0.1em;
        }
    }
</style>
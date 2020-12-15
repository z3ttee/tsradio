<template>
    <section>
        <app-messagebox>
            <template #title>Da ist etwas schief gelaufen!</template>
            <template #subtitle>Whooops!</template>
            <template #content>
                <p>Es sieht so aus, als wäre der Service zurzeit nicht erreichbar! Bitte versuch' es später nochmal oder wende dich an einen Administrator.</p>
                <ul>
                    <li class="label">Folgende Fehler könnten die Ursache sein:</li>
                    <li>Eine Störung des Servers</li>
                    <li>Keine oder schlechte Internetverbindung</li>
                </ul>
                <ul>
                    <li class="label"><button class="btn btn-primary btn-m" @click="reloadPage">Seite neuladen</button></li>
                </ul>
            </template>
        </app-messagebox>
    </section>
</template>

<script>
export default {
    methods: {
        reloadPage() {
            this.$store.state.appIsReady = false
            this.$router.push({name: 'home'})
        }
    }
}
</script>
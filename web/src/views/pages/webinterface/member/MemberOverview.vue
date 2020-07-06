<template>
    <div>
        <h2>Benutzerübersicht</h2>
        <hr class="interface large">
        <error-message :error="error" v-if="error"></error-message>
        <hr class="interface large" v-if="error">

        <table v-if="!loading">
            <thead>
                <tr>
                    <th>Benutzername</th>
                    <th>UUID</th>
                    <th>Gruppe</th>
                    <th>Beitritt am</th>
                    <th>Aktionen</th>
                </tr>
            </thead>
            
            <tbody>
                <tr class="tsr_entry" v-for="(member, index) in members" :key="member.id+index">
                    <td>{{ member.name }}</td>
                    <td>{{ member.id }}</td>
                    <td>{{ (member.permissionGroup ? '' : 'N/A') }}</td>
                    <td>{{ new Date(member.creation).toDateString() }}</td>
                    <td><button class="btn btn-secondary" @click="deleteMember">Löschen</button> <button class="btn btn-secondary" @click="deleteMember">Bearbeiten</button></td>
                </tr>
            </tbody>
        </table>
        <app-loader v-show="loading"></app-loader>
    </div>
</template>
<script>
import axios from 'axios';
import AppLoader from '@/components/loader/ContentLoader.vue';
import ErrorMessage from '@/components/message/ErrorMessage.vue';

export default {
    components: {
        ErrorMessage,
        AppLoader
    },
    data() {
        return {
            loading: true,
            error: undefined,
            members: []
        }
    },
    methods: {
        deleteMember() {

        }
    },
    mounted() {
        axios.get('member/list/').then(response => {
            if(response.status == 200 && response.data.meta.status == 200) {
                this.members = response.data.payload;
            } else {
                if(response.data.meta.status == 404) {
                    this.error = "Es existieren noch keine Einträge in der Datenbank";
                } else {
                    this.error = response.data.meta.message;
                }
            }
        }).catch(error => {
            this.error = "Ein Fehler ist aufgetreten: Die Services sind derzeit nicht erreichbar."
            console.log(error);
        }).finally(this.loading = false);
    }
}
</script>

<style lang="scss" scoped>
</style>
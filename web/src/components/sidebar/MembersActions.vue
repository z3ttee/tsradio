<template>
    <div class="action_group">
        <router-link :to="{name: 'webinterfaceMembersAction', params: {action: 'overview'}}" tag="button" class="btn btn-secondary btn-large btn-leftalign" active-class="active">Übersicht</router-link>
        <router-link :to="{name: 'webinterfaceMembersAction', params: {action: 'add'}}" tag="button" class="btn btn-secondary btn-large btn-leftalign" active-class="active">Benutzer hinzufügen</router-link>
    </div>
</template>
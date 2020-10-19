<template>
    <div class="setup-form">
        <h3>Setup Database</h3>
        <br>

        <div class="form-group-inline">
            <label for="database_host">Enter database host</label>
            <input type="text" name="database_host" id="database_host" placeholder="e.g. localhost">
        </div>
        <div class="form-group-inline">
            <label for="database_port">Enter database port</label>
            <input type="number" name="database_port" id="database_port" placeholder="e.g. 3306">
        </div>
        <div class="form-group">
            <label for="database_name">Enter database name</label>
            <input type="text" name="database_name" id="database_name" placeholder="e.g. database">
        </div>
        <div class="form-group">
            <label for="database_username">Enter database username</label>
            <input type="text" name="database_username" id="database_username" placeholder="e.g. username">
        </div>
        <div class="form-group">
            <label for="database_password">Enter database password</label>
            <input type="password" name="database_password" id="database_password" placeholder="e.g. password">
        </div>
        <div class="form-group">
            <button class="btn btn-accent btn-full">Next</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/forms.scss';
</style>
package live.tsradio.master.api.auth

data class AuthData(
    var accountType: AccountType,
    val hash: String,
    var granted: Boolean
)
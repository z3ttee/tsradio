package live.tsradio.dataserver

class ChatObject {
    private var userName: String? = null
    private var message: String? = null

    constructor()
    constructor(userName: String?, message: String?) {
        this.userName = userName
        this.message = message
    }

    fun getUserName(): String? {
        return userName
    }

    fun setUserName(userName: String?) {
        this.userName = userName
    }

    fun getMessage(): String? {
        return message
    }

    fun setMessage(message: String?) {
        this.message = message
    }

}
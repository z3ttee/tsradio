package live.tsradio.daemon.listener

interface IcecastConnectionListener {

    fun onConnectionEstablished()
    fun onConnectionError(exception: Exception)
    fun onConnectionLost()

}
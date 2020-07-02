package live.tsradio.daemon.events

interface IcecastConnectionListener {

    fun onConnectionEstablished()
    fun onConnectionError(exception: Exception)
    fun onConnectionLost()

}
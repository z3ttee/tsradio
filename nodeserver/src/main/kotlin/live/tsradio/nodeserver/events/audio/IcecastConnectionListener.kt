package live.tsradio.nodeserver.events.audio

interface IcecastConnectionListener {

    fun onConnectionEstablished()
    fun onConnectionError(exception: Exception)
    fun onConnectionLost()

}
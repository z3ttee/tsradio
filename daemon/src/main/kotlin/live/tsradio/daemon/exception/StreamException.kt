package live.tsradio.daemon.exception

class StreamException(val msg: String): Exception("Streaming audio failed: $msg") {
}
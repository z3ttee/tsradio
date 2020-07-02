package live.tsradio.nodeserver.exception

class StreamException(val msg: String): Exception("Streaming audio failed: $msg") {
}
package live.tsradio.master.exception

class StreamException(msg: String): Exception("Streaming audio failed: $msg") {
}
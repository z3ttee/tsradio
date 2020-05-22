package live.tsradio.daemon.protocol

/**
 * desc...
 *
 * @author caorong
 */
enum class MimeType(val contentType: String) {
    mp3("audio/mpeg"), ogg("application/ogg"), audioWebm("audio/webm"), videoWebm("video/webm");

}
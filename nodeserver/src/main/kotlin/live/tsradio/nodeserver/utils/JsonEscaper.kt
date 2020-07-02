package live.tsradio.nodeserver.utils

object JsonEscaper {

    private val chars = HashMap<Char, String>(
        mapOf(
            Pair('"', "\"")
        )
    )

    fun escape(literal: String): String{
        var escaped = literal
        for(pair in chars) {
            escaped = escaped.replace(pair.key.toString(), pair.value)
        }
        return escaped
    }
}
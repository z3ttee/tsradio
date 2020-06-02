package live.tsradio.daemon.utils

object SQLEscaper {

    private val chars = HashMap<String, String>(
        mapOf(
            Pair("'", "&#39;"),
            Pair("(", "&#040;"),
            Pair(")", "&#041;"),
            Pair("`", "&#096;")
        )
    )

    fun escape(literal: String): String{
        for(pair in chars) {
            literal.replace(pair.key, pair.value)
        }
        return literal
    }
}
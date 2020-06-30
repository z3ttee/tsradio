package live.tsradio.daemon.utils

import org.slf4j.Logger
import org.slf4j.LoggerFactory

object SQLEscaper {
    private val logger: Logger = LoggerFactory.getLogger(SQLEscaper::class.java)

    private val chars = HashMap<String, String>(
        mapOf(
            Pair("'", "&#39;"),
            Pair("`", "&#096;")
        )
    )

    fun escape(literal: String): String{
        var escaped = literal
        for(pair in chars) {
            escaped = escaped.replace(pair.key, pair.value)
        }
        return escaped
    }
}
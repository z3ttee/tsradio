package live.tsradio.discordbot.api

import org.json.simple.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import reactor.core.publisher.Mono
import java.io.BufferedReader
import java.net.URL
import java.nio.charset.Charset

class ApiRequest {
    private val logger: Logger = LoggerFactory.getLogger(ApiRequest::class.java)

    private var endpoint: String = ""
    private var method: String = ""
    private var params: String = ""
    private var version: Version = Version.V1
    private var headers: ArrayList<String> = ArrayList()

    fun version(version: Version): ApiRequest {
        this.version = version
        return this
    }
    fun endpoint(endpoint: String): ApiRequest {
        this.endpoint = endpoint
        return this
    }
    fun queryParams(params: ArrayList<String>): ApiRequest {
        this.params = params.joinToString("&")
        return this
    }
    fun method(method: String): ApiRequest {
        this.method = method
        return this
    }
    fun setHeader(header: String): ApiRequest {
        this.headers.add(header)
        return this
    }
    fun get(): Mono<JSONObject> {
        return Mono.fromRunnable { Thread(Runnable {
            logger.info("get(): Requesting.")

            val url : URL = URL("https://tsradio.live/api/${version.path}/$endpoint${
                when (params.isNotEmpty()) {
                    true -> params
                    else -> ""
                }
            }")

            val connection = url.openConnection()

            connection.setRequestProperty("Authorization", "Basic ts:Volksempfang1488")
            connection.useCaches = false
            connection.doInput = true
            connection.doOutput = true

            connection.connect()

            val inputStream = connection.getInputStream()
            val inReader = inputStream.reader(Charset.forName("UTF-8"))
            val responseString = inputStream.bufferedReader(Charset.forName("UTF-8")).use(BufferedReader::readText)

            logger.info(url.toString())
            logger.info(responseString)

            logger.info("get(): Done.")
        }).start() }
    }
}

private val logger: Logger = LoggerFactory.getLogger(ApiRequest::class.java)

fun main(args: Array<String>) {
    ApiRequest().get().subscribe {
        logger.info(it.toJSONString())
    }
}
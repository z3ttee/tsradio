package live.tsradio.discordbot.api

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import reactor.core.publisher.Mono

class ApiRequest {
    private val logger: Logger = LoggerFactory.getLogger(ApiRequest::class.java)

    private var endpoint: String = ""
    private var method: String = ""
    private var headers: ArrayList<String> = ArrayList()

    fun endpoint(endpoint: String): ApiRequest {
        this.endpoint = endpoint
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

    fun get(): Mono<Result> {
        return Mono.fromRunnable { Thread(Runnable {
            logger.info("get(): Requesting.")
            Thread.sleep(1000)
            logger.info("get(): Done.")
        }).start() }
    }
}
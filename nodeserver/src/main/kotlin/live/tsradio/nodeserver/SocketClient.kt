package live.tsradio.nodeserver

import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import live.tsradio.nodeserver.events.Events
import live.tsradio.nodeserver.events.channel.OnNodeChannelUpdate
import live.tsradio.nodeserver.events.client.OnClientAuthenticatedEvent
import live.tsradio.nodeserver.events.client.OnClientConnectionEvent
import live.tsradio.nodeserver.events.client.OnClientDisconnectEvent
import live.tsradio.nodeserver.events.client.OnClientReconnectFailedEvent
import live.tsradio.nodeserver.events.server.OnServerErrorEvent
import live.tsradio.nodeserver.files.Filesystem
import okhttp3.OkHttpClient
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.security.SecureRandom
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

object SocketClient {
    private val logger: Logger = LoggerFactory.getLogger(SocketClient::class.java)
    var socket: Socket? = null
    var authenticated: Boolean = false

    fun start() {
        val okHttpClient = getUnsafeOkHttpClient()

        IO.setDefaultOkHttpWebSocketFactory(okHttpClient)
        IO.setDefaultOkHttpCallFactory(okHttpClient)

        val options = IO.Options()
        options.query = "authenticate="+Gson().toJson(Core.authData)

        val protocol = when(Filesystem.preferences.master.ssl) {
            true -> "https://"
            else -> "http://"
        }

        socket = IO.socket("${protocol}${Filesystem.preferences.master.host}:${Filesystem.preferences.master.port}", options)
        if(socket != null) {
            socket!!.on(Socket.EVENT_CONNECT, OnClientConnectionEvent())
                    .on(Socket.EVENT_DISCONNECT, OnClientDisconnectEvent())
                    .on(Socket.EVENT_RECONNECT_FAILED, OnClientReconnectFailedEvent())
                    .on(Events.EVENT_SERVER_ERROR, OnServerErrorEvent())
                    .on(Events.EVENT_CLIENT_AUTHENTICATED, OnClientAuthenticatedEvent())
                    .on(Events.EVENT_NODE_CHANNEL_UPDATE, OnNodeChannelUpdate())
            socket!!.connect()
        }
    }

    private fun getUnsafeOkHttpClient(): OkHttpClient? {
        return try {
            // Create a trust manager that does not validate certificate chains
            val trustAllCerts = arrayOf<TrustManager>(
                    object : X509TrustManager {
                        @Throws(CertificateException::class)
                        override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {
                        }

                        @Throws(CertificateException::class)
                        override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {
                        }

                        override fun getAcceptedIssuers(): Array<X509Certificate> {
                            return arrayOf()
                        }
                    }
            )

            // Install the all-trusting trust manager
            val sslContext = SSLContext.getInstance("SSL")
            sslContext.init(null, trustAllCerts, SecureRandom())

            // Create an ssl socket factory with our all-trusting manager
            val sslSocketFactory = sslContext.socketFactory
            val builder = OkHttpClient.Builder()

            builder.sslSocketFactory(sslSocketFactory, trustAllCerts[0] as X509TrustManager)
            builder.hostnameVerifier { hostname, session -> true }
            builder.build()
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }
}
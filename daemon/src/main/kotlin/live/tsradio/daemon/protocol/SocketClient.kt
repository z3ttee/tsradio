package live.tsradio.daemon.protocol

import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import io.socket.client.IO
import io.socket.client.Socket
import live.tsradio.daemon.channel.ChannelHandler
import live.tsradio.daemon.files.Filesystem
import live.tsradio.daemon.protocol.packets.Packet
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
        options.query = "&authenticate={\"id\": \"${Filesystem.preferences.node.nodeID}\", \"key\": \"${Filesystem.preferences.node.sessionHash}\"}"

        socket = IO.socket("https://${Filesystem.preferences.dataserver.host}:${Filesystem.preferences.dataserver.port}", options)
        if(socket != null) {
            socket!!.on(Socket.EVENT_CONNECT) { onSocketConnected() }
                    .on(Socket.EVENT_DISCONNECT) { onSocketDisconnected() }
                    .on(Socket.EVENT_RECONNECTING) { onSocketReconnecting() }
                    .on(Socket.EVENT_RECONNECT_FAILED){ onSocketReconnectFailed() }
                    .on("onAuthenticated") {
                        val json = JsonParser().parse(it[0].toString()).asJsonObject
                        onSocketAuthenticated(json)
                    }
            socket!!.connect()
        }
    }

    private fun onSocketConnected() {
        logger.info("Connected to dataserver '${Filesystem.preferences.dataserver.host}:${Filesystem.preferences.dataserver.port}'")
    }
    private fun onSocketDisconnected() {
        logger.error("Disconnected from dataserver. ChannelInfo transmission impossible.")
    }
    private fun onSocketReconnecting() {
        logger.info("Reconnecting to dataserver...")
    }
    private fun onSocketReconnectFailed() {
        logger.info("Failed to reconnect to dataserver")
    }
    private fun onSocketAuthenticated(data: JsonObject) {
        authenticated = data["status"].asInt == 200 && data["accepted"].asBoolean

        if(authenticated) {
            logger.info("Authentication successful.")
            sendAllChannelUpdate()
        } else {
            logger.error("Could not authenticate")
        }
    }

    fun sendPacket(packet: Packet) {
        if(socket != null && socket!!.connected()) {
            socket!!.emit(packet.eventName, GsonBuilder().create().toJson(packet))
        }
    }

    fun sendAllChannelUpdate(){
        for(channel in ChannelHandler.activeChannels.values) {
            sendPacket(channel.data)
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
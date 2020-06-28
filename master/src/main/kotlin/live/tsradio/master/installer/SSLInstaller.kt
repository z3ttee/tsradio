package live.tsradio.master.installer

import live.tsradio.master.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File

class SSLInstaller {
    private val logger: Logger = LoggerFactory.getLogger(SSLInstaller::class.java)

    fun install() {
        val pkcs12 = File(Filesystem.sslDirectory, "fullchain.pkcs12")

        Runtime.getRuntime().exec("openssl pkcs12 -export -out "+pkcs12.absolutePath+" -in "+Filesystem.fullchainFile.absolutePath)
        Runtime.getRuntime().exec("keytool -v -importkeystore -srckeystore "+pkcs12.absolutePath+" -destkeystore "+Filesystem.keystoreFile.absolutePath+" -deststoretype JKS")

        logger.info("SSL certificate installed.")
    }

}
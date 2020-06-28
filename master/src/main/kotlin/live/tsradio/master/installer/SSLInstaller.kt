package live.tsradio.master.installer

import live.tsradio.master.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.nio.charset.Charset

class SSLInstaller {
    private val logger: Logger = LoggerFactory.getLogger(SSLInstaller::class.java)

    fun install() {
        val pkcs12 = File(Filesystem.sslDirectory, "fullchain.pkcs12")

        var proc = Runtime.getRuntime().exec("openssl pkcs12 -export -out "+pkcs12.absolutePath+" -in "+Filesystem.fullchainFile.absolutePath+" -inkey "+Filesystem.privkeyFile.absolutePath+" -password pass:"+Filesystem.preferences.dataserver.privateKeyPassword)
        var stdIn = BufferedReader(InputStreamReader(proc.inputStream))
        var stdError = BufferedReader(InputStreamReader(proc.errorStream))

        var s: String?
        while (stdIn.readLine().also { s = it } != null) {
            logger.info(s)
        }

        while (stdError.readLine().also { s = it } != null) {
            logger.info(s)
        }

        proc = Runtime.getRuntime().exec("keytool -v -importkeystore -srckeystore "+pkcs12.absolutePath+" -srcstorepass "+Filesystem.preferences.dataserver.privateKeyPassword+" -destkeystore "+Filesystem.keystoreFile.absolutePath+" -deststorepass "+Filesystem.preferences.dataserver.privateKeyPassword+" -deststoretype JKS")
        stdIn = BufferedReader(InputStreamReader(proc.inputStream))
        stdError = BufferedReader(InputStreamReader(proc.errorStream))

        while (stdIn.readLine().also { s = it } != null) {
            logger.info(s)
        }

        while (stdError.readLine().also { s = it } != null) {
            logger.info(s)
        }

        Thread.sleep(50)
        if(Filesystem.keystoreFile.exists()) {
            logger.info("SSL certificate installed.")
        } else {
            logger.error("Installation not done successfully. Check if you entered the correct password that was used to sign the private key")
        }

        pkcs12.deleteOnExit()
    }

}
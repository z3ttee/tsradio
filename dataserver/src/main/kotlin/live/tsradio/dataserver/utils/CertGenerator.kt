package live.tsradio.dataserver.utils

import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.shredzone.acme4j.*
import org.shredzone.acme4j.challenge.Challenge
import org.shredzone.acme4j.challenge.Dns01Challenge
import org.shredzone.acme4j.challenge.Http01Challenge
import org.shredzone.acme4j.exception.AcmeException
import org.shredzone.acme4j.util.CSRBuilder
import org.shredzone.acme4j.util.KeyPairUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileReader
import java.io.FileWriter
import java.io.IOException
import java.net.URI
import java.security.KeyPair
import java.security.Security
import kotlin.system.exitProcess

private val logger: Logger = LoggerFactory.getLogger(CertGenerator::class.java)

/*fun main(args: Array<String>) {
    if (args.isEmpty()) {
        System.err.println("Usage: ClientTest <domain>...")
        exitProcess(1)
    }
    logger.info("Starting up...")
    Security.addProvider(BouncyCastleProvider())
    val domains: Collection<String> = args.toCollection(ArrayList())
    try {
        val ct = CertGenerator()
        ct.fetchCertificate(domains)
    } catch (ex: Exception) {
        logger.error("Failed to get a certificate for domains $domains", ex)
    }
}*/

class CertGenerator {

    // File name of the User Key Pair
    private val USER_KEY_FILE: File = File(System.getProperty("user.dir"), "user.key")

    // File name of the Domain Key Pair
    private val DOMAIN_KEY_FILE: File = File(System.getProperty("user.dir"), "domain.key")

    // File name of the CSR
    private val DOMAIN_CSR_FILE: File = File(System.getProperty("user.dir"), "domain.csr")

    // File name of the signed certificate
    private val DOMAIN_CHAIN_FILE: File = File(System.getProperty("user.dir"), "domain-chain.crt")

    //Challenge type to be used
    private val CHALLENGE_TYPE = ChallengeType.HTTP

    // RSA key size of generated key pairs
    private val KEY_SIZE = 2048

    private enum class ChallengeType {
        HTTP, DNS
    }

    /**
     * Generates a certificate for the given domains. Also takes care for the registration
     * process.
     *
     * @param domains
     * Domains to get a common certificate for
     */
    @Throws(IOException::class, AcmeException::class)
    fun fetchCertificate(domains: Collection<String?>?) {
        // Load the user key file. If there is no key file, create a new one.
        val userKeyPair = loadOrCreateUserKeyPair()

        // Create a session for Let's Encrypt.
        // Use "acme://letsencrypt.org" for production server
        val session = Session("acme://letsencrypt.org/staging")

        // Get the Account.
        // If there is no account yet, create a new one.
        val acct = findOrRegisterAccount(session, userKeyPair)

        // Load or create a key pair for the domains. This should not be the userKeyPair!
        val domainKeyPair = loadOrCreateDomainKeyPair()

        // Order the certificate
        val order: Order = acct.newOrder().domains(domains).create()

        // Perform all required authorizations
        for (auth in order.authorizations) {
            authorize(auth)
        }

        // Generate a CSR for all of the domains, and sign it with the domain key pair.
        val csrb = CSRBuilder()
        csrb.addDomains(domains)
        csrb.sign(domainKeyPair)
        FileWriter(DOMAIN_CSR_FILE).use { out -> csrb.write(out) }

        // Order the certificate
        order.execute(csrb.encoded)

        // Wait for the order to complete
        try {
            var attempts = 10
            while (order.status !== Status.VALID && attempts-- > 0) {
                // Did the order fail?
                if (order.status === Status.INVALID) {
                    throw AcmeException("Order failed... Giving up.")
                }

                // Wait for a few seconds
                Thread.sleep(3000L)

                // Then update the status
                order.update()
            }
        } catch (ex: InterruptedException) {
            logger.error("interrupted", ex)
            Thread.currentThread().interrupt()
        }

        // Get the certificate
        val certificate: Certificate = order.certificate!!
        logger.info("Success! The certificate for domains {} has been generated!", domains)
        logger.info("Certificate URL: {}", certificate.location)
        FileWriter(DOMAIN_CHAIN_FILE).use { fw -> certificate.writeCertificate(fw) }

        // That's all! Configure your web server to use the DOMAIN_KEY_FILE and
        // DOMAIN_CHAIN_FILE for the requested domains.
    }

    /**
     * Loads a user key pair from [.USER_KEY_FILE]. If the file does not exist, a
     * new key pair is generated and saved.
     *
     *
     * Keep this key pair in a safe place! In a production environment, you will not be
     * able to access your account again if you should lose the key pair.
     *
     * @return User's [KeyPair].
     */
    @Throws(IOException::class)
    private fun loadOrCreateUserKeyPair(): KeyPair {
        if (USER_KEY_FILE.exists()) {
            // If there is a key file, read it
            FileReader(USER_KEY_FILE).use { fr -> return KeyPairUtils.readKeyPair(fr) }
        } else {
            // If there is none, create a new key pair and save it
            val userKeyPair: KeyPair = KeyPairUtils.createKeyPair(KEY_SIZE)
            FileWriter(USER_KEY_FILE).use { fw -> KeyPairUtils.writeKeyPair(userKeyPair, fw) }
            return userKeyPair
        }
    }

    /**
     * Loads a domain key pair from [.DOMAIN_KEY_FILE]. If the file does not exist,
     * a new key pair is generated and saved.
     *
     * @return Domain [KeyPair].
     */
    @Throws(IOException::class)
    private fun loadOrCreateDomainKeyPair(): KeyPair {
        if (DOMAIN_KEY_FILE.exists()) {
            FileReader(DOMAIN_KEY_FILE).use { fr -> return KeyPairUtils.readKeyPair(fr) }
        } else {
            val domainKeyPair: KeyPair = KeyPairUtils.createKeyPair(KEY_SIZE)
            FileWriter(DOMAIN_KEY_FILE).use { fw -> KeyPairUtils.writeKeyPair(domainKeyPair, fw) }
            return domainKeyPair
        }
    }

    /**
     * Finds your [Account] at the ACME server. It will be found by your user's
     * public key. If your key is not known to the server yet, a new account will be
     * created.
     *
     *
     * This is a simple way of finding your [Account]. A better way is to get the
     * URL of your new account with [Account.getLocation] and store it somewhere.
     * If you need to get access to your account later, reconnect to it via [ ][Session.login] by using the stored location.
     *
     * @param session
     * [Session] to bind with
     * @return [Account]
     */
    @Throws(AcmeException::class)
    private fun findOrRegisterAccount(session: Session, accountKey: KeyPair): Account {
        // Ask the user to accept the TOS, if server provides us with a link.
        val tos: URI? = session.metadata.termsOfService
        if (tos != null) {
            acceptAgreement(tos)
        }
        val account = AccountBuilder()
                .agreeToTermsOfService()
                .useKeyPair(accountKey)
                .create(session)
        logger.info("Registered a new user, URL: {}", account.location)
        return account
    }

    /**
     * Authorize a domain. It will be associated with your account, so you will be able to
     * retrieve a signed certificate for the domain later.
     *
     * @param auth
     * [Authorization] to perform
     */
    @Throws(AcmeException::class)
    private fun authorize(auth: Authorization) {
        logger.info("Authorization for domain {}", auth.identifier.domain)

        // The authorization is already valid. No need to process a challenge.
        if (auth.status == Status.VALID) {
            return
        }

        // Find the desired challenge and prepare it.
        var challenge: Challenge? = null
        challenge = when (CHALLENGE_TYPE) {
            ChallengeType.HTTP -> httpChallenge(auth)
            ChallengeType.DNS -> dnsChallenge(auth)
        }
        if (challenge == null) {
            throw AcmeException("No challenge found")
        }

        // If the challenge is already verified, there's no need to execute it again.
        if (challenge.status === Status.VALID) {
            return
        }

        // Now trigger the challenge.
        challenge.trigger()

        // Poll for the challenge to complete.
        try {
            var attempts = 10
            while (challenge.status !== Status.VALID && attempts-- > 0) {
                // Did the authorization fail?
                if (challenge.status === Status.INVALID) {
                    throw AcmeException("Challenge failed... Giving up.")
                }

                // Wait for a few seconds
                Thread.sleep(3000L)

                // Then update the status
                challenge.update()
            }
        } catch (ex: InterruptedException) {
            logger.error("interrupted", ex)
            Thread.currentThread().interrupt()
        }

        // All reattempts are used up and there is still no valid authorization?
        if (challenge.status !== Status.VALID) {
            throw AcmeException("Failed to pass the challenge for domain "
                    + auth.identifier.domain + ", ... Giving up.")
        }
        logger.info("Challenge has been completed. Remember to remove the validation resource.")
        completeChallenge("Challenge has been completed.\nYou can remove the resource again now.")
    }

    /**
     * Prepares a HTTP challenge.
     *
     *
     * The verification of this challenge expects a file with a certain content to be
     * reachable at a given path under the domain to be tested.
     *
     *
     * This example outputs instructions that need to be executed manually. In a
     * production environment, you would rather generate this file automatically, or maybe
     * use a servlet that returns [Http01Challenge.getAuthorization].
     *
     * @param auth
     * [Authorization] to find the challenge in
     * @return [Challenge] to verify
     */
    @Throws(AcmeException::class)
    fun httpChallenge(auth: Authorization): Challenge? {
        // Find a single http-01 challenge
        val challenge = auth.findChallenge(Http01Challenge::class.java)
                ?: throw AcmeException("Found no " + Http01Challenge.TYPE + " challenge, don't know what to do...")

        // Output the challenge, wait for acknowledge...
        logger.info("Please create a file in your web server's base directory.")
        logger.info("It must be reachable at: http://{}/.well-known/acme-challenge/{}",
                auth.identifier.domain, challenge.token)
        logger.info("File name: {}", challenge.token)
        logger.info("Content: {}", challenge.authorization)
        logger.info("The file must not contain any leading or trailing whitespaces or line breaks!")
        logger.info("If you're ready, dismiss the dialog...")
        val message = StringBuilder()
        message.append("Please create a file in your web server's base directory.\n\n")
        message.append("http://")
                .append(auth.identifier.domain)
                .append("/.well-known/acme-challenge/")
                .append(challenge.token)
                .append("\n\n")
        message.append("Content:\n\n")
        message.append(challenge.authorization)
        acceptChallenge(message.toString())
        return challenge
    }

    /**
     * Prepares a DNS challenge.
     *
     *
     * The verification of this challenge expects a TXT record with a certain content.
     *
     *
     * This example outputs instructions that need to be executed manually. In a
     * production environment, you would rather configure your DNS automatically.
     *
     * @param auth
     * [Authorization] to find the challenge in
     * @return [Challenge] to verify
     */
    @Throws(AcmeException::class)
    fun dnsChallenge(auth: Authorization): Challenge? {
        // Find a single dns-01 challenge
        val challenge = auth.findChallenge<Dns01Challenge>(Dns01Challenge.TYPE)
                ?: throw AcmeException("Found no " + Dns01Challenge.TYPE + " challenge, don't know what to do...")

        // Output the challenge, wait for acknowledge...
        logger.info("Please create a TXT record:")
        logger.info("_acme-challenge.{}. IN TXT {}",
                auth.identifier.domain, challenge.digest)
        logger.info("If you're ready, dismiss the dialog...")
        val message = StringBuilder()
        message.append("Please create a TXT record:\n\n")
        message.append("_acme-challenge.")
                .append(auth.identifier.domain)
                .append(". IN TXT ")
                .append(challenge.digest)
        acceptChallenge(message.toString())
        return challenge
    }

    /**
     * Presents the instructions for preparing the challenge validation, and waits for
     * dismissal. If the user cancelled the dialog, an exception is thrown.
     *
     * @param message
     * Instructions to be shown in the dialog
     */
    @Throws(AcmeException::class)
    fun acceptChallenge(message: String?) {
        // TODO: Scanner
        /*val option = JOptionPane.showConfirmDialog(null,
                message,
                "Prepare Challenge",
                JOptionPane.OK_CANCEL_OPTION)
        if (option == JOptionPane.CANCEL_OPTION) {
            throw AcmeException("User cancelled the challenge")
        }*/
    }

    /**
     * Presents the user a link to the Terms of Service, and asks for confirmation. If the
     * user denies confirmation, an exception is thrown.
     *
     * @param agreement
     * [URI] of the Terms of Service
     */
    @Throws(AcmeException::class)
    fun acceptAgreement(agreement: URI) {
        // TODO: Scanner
        /*val option = JOptionPane.showConfirmDialog(null,
                "Do you accept the Terms of Service?\n\n$agreement",
                "Accept ToS",
                JOptionPane.YES_NO_OPTION)
        if (option == JOptionPane.NO_OPTION) {
            throw AcmeException("User did not accept Terms of Service")
        }*/
    }

    /**
     * Presents the instructions for removing the challenge validation, and waits for
     * dismissal.
     *
     * @param message
     * Instructions to be shown in the dialog
     */
    @Throws(AcmeException::class)
    fun completeChallenge(message: String?) {
        logger.info("Challenge complete: $message")
    }
}


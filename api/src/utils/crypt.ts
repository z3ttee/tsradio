import fs from 'fs'
import crypto from 'crypto'
import cryptojs from 'crypto-js'
import config from '../config/config'

const STRING_ENCODING = "base64"
const SECRET_SIZE = 256

export default class CryptUtil {
    private static instance: CryptUtil = undefined

    private directory: string = config.app.rootDir+"/config/crypt/"
    private cryptPrivSecretFile: string = this.directory+"private.secret"
    private cryptJwtSecretFile: string = this.directory+"jwt.secret"

    private jwtSecret?: string
    private privateSecret?: string

    constructor() {
        if(!fs.existsSync(this.cryptPrivSecretFile)) {
            fs.mkdirSync(this.directory, { recursive: true })
            this.privateSecret = this.generatePrivateSecret()
        } else{
            this.privateSecret = fs.readFileSync(this.cryptPrivSecretFile).toString(STRING_ENCODING)
        }

        if(!fs.existsSync(this.cryptJwtSecretFile)) {
            fs.mkdirSync(this.directory, { recursive: true })
            this.jwtSecret = this.generateJwtSecret()
        } else {
            this.jwtSecret = fs.readFileSync(this.cryptPrivSecretFile).toString(STRING_ENCODING)
        }
    }

    /**
     * Generate new private secret (used for password encryption) and write to file
     */
    generatePrivateSecret() {
        console.log("Generating private secret for encryption...")
        let random = crypto.randomBytes(SECRET_SIZE).toString(STRING_ENCODING)
        fs.writeFileSync(this.cryptPrivSecretFile, random)
        return random
    }

    /**
     * Generate new private secret (used for jsonwebtoken signing) and write to file
     */
    generateJwtSecret() {
        console.log("Generating jwt secret for encryption...")
        let random = crypto.randomBytes(SECRET_SIZE).toString(STRING_ENCODING)
        fs.writeFileSync(this.cryptJwtSecretFile, random)
        return random
    }

    /**
     * Get private secret value
     */
    getPrivateSecret() {
        return this.privateSecret
    }

    /**
     * Get jsonwebtoken secret value
     */
    getJwtSecret(){
        return this.jwtSecret
    }

    /**
     * Encrypt a string using AES
     * @param str String to encrypt
     */
    encryptString(str) {
        return cryptojs.AES.encrypt(str, this.getPrivateSecret()).toString()
    }

    /**
     * Decrypt a string using AES
     * @param str String to decrypt
     */
    decryptString(hash) {
        let bytes = cryptojs.AES.decrypt(hash, this.getPrivateSecret());
        let plaintext = bytes.toString(cryptojs.enc.Utf8);
        return plaintext
    }

    /**
     * Get cryptutil instance
     */
    static getInstance(): CryptUtil {
        if(!this.instance) this.instance = new CryptUtil()
        return this.instance
    }
}
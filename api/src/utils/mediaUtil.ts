import fs from 'fs'
import config from '../config/config'

import sharp from 'sharp'

import ffprobeStatic from 'ffprobe-static'
import ffprobe from 'ffprobe'
import { randomBytes } from 'crypto'
import { Endpoint } from '../endpoint/endpoint'
import { TrustedError } from '../error/trustedError'
import { Channel } from '../models/channel'
import { Response } from 'express'

const COVERS_DIRECTORY = config.app.rootDir + "/uploads/covers"
const MIME_TYPES = [
    { type: 'image/png', ext: '.png'},
    { type: 'image/gif', ext: '.gif'},
    { type: 'image/jpg', ext: '.jpg'},
    { type: 'image/jpeg', ext: '.jpeg'}
]

export class MediaUtil {

    /**
     * Check if upload directories exist and create them if needed
     */
    static setupUploadDirectory() {
        if(!fs.existsSync(COVERS_DIRECTORY)) {
            fs.mkdirSync(COVERS_DIRECTORY, { recursive: true })
        }
    }

    /**
     * Get file properties using ffprobe
     * @param filePath File
     * @returns ffprobe Object
     */
    static async getMediaInfo(filePath): Promise<Object> {
        return new Promise((resolve, reject) => {
            ffprobe(filePath, { path: ffprobeStatic.path }).then((info) => {
                resolve(info)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * Creates a cover for specific channel.
     * The provided file is optimized to specifications (e.g.: size)
     * @param channel Channel object
     * @returns {Endpoint.Result} Endpoint result
     */
    static async createCoverImage(channel: Channel, mimetype) {
        return new Promise<Endpoint.Result>(async(resolve) => {
            let oldAvatarHash = channel.coverHash

            let newCoverHash
            let file

            do {
                newCoverHash = randomBytes(8).toString('hex')
                file = COVERS_DIRECTORY + "/"+newCoverHash + ".jpeg"
            } while(fs.existsSync(file))
            
            if(!this.isSupportedFormat(mimetype)) {
                return TrustedError.get(TrustedError.Errors.UNSUPPORTED_FORMAT)
            }

            let tempFile = COVERS_DIRECTORY + "/" + newCoverHash + ".temp."+this.getExtensionForMimetype(mimetype)
            let fsstream = fs.createWriteStream(tempFile)
            file.pipe(fsstream)
    
            fsstream.on('close', async () => {
                // Finished Upload
                // Delete previous cover file and update cover column in database
                this.deleteCoverByHash(oldAvatarHash)
                await channel.update({ coverHash: newCoverHash })
                let result = await this.optimizeCover(newCoverHash, tempFile)

                if(result instanceof TrustedError) {
                    resolve(result)
                } else {
                    resolve(new Endpoint.ResultSingleton(200, undefined))
                }
            })
    
            fsstream.on('error', async(err) => {
                // Upload failed
                // Revert changes
                console.error(err)
                this.deleteFile(tempFile)
                resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
            })
        })
    }

    /**
     * Optimize a channel's cover. The image will be resized to 512x512
     * @param coverHash Hash of the cover
     * @param tempFile File of the temporary cover image
     * @returns Endpoint Result
     */
    static async optimizeCover(coverHash: string, tempFile: string) {
        return new Promise<Endpoint.Result>((resolve) => {
            let optimizedFiled = COVERS_DIRECTORY + "/" + coverHash + ".jpeg"

            sharp(tempFile).resize(512, 512).toFile(optimizedFiled).then(() => {
                resolve(new Endpoint.ResultSingleton(200, undefined))
            }).catch((error) => {
                console.log(error)
                resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
            }).finally(() => {
                this.deleteFile(tempFile)
            })
        })
    }

    /**
     * Delete a file asynchronously
     * @param file File to delete
     */
    static async deleteFile(file) {
        if(fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    }

    /**
     * Delete the cover of a channel
     * @param channel Channel
     * @returns Endpoint Result
     */
    static async deleteCover(channel: Channel) {
        return new Promise<Endpoint.Result>((resolve) => {
            try {
                let file = COVERS_DIRECTORY + "/" + channel.coverHash + ".jpeg"
            
                this.deleteFile(file)
                channel.update({ avatar: null }).finally(() => resolve(new Endpoint.ResultSingleton(200, undefined)))
            } catch (err) {
                resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
            }
        })
    }

    /**
     * Delete the cover found using given hash
     * @param coverHash Cover's hash
     */
    static async deleteCoverByHash(coverHash: string) {
        let file = COVERS_DIRECTORY + "/" + coverHash + ".jpeg"
        this.deleteFile(file)
    }

    /**
     * Check if MIME-Type is supported
     * @param mimetype MIME-Type to check
     * @returns True or False
     */
    static isSupportedFormat(mimetype: String) {
        return !!MIME_TYPES.find((element) => element.type == mimetype)
    }

    /**
     * Get the file extension matching a supported MIME-Type
     * @param mimetype MIME-Type
     * @returns String (e.g.: image/jpeg)
     */
    static getExtensionForMimetype(mimetype: string) {
        return MIME_TYPES.find((element) => element.type == mimetype)?.ext
    }

    /**
     * Get the cover file of a given cover hash
     * @param coverHash Cover's hash
     * @returns File path
     */
    static getCoverFileByHash(coverHash: string): string {
        let file = COVERS_DIRECTORY + "/" + coverHash + ".jpeg"

        if(!fs.existsSync(file)) {
            file = config.app.rootDir+"/assets/images/ts_logo_background.jpeg"
        }

        return file;
    }

    /**
     * Send a file as response
     * @param file File
     * @param response Express Response
     */
    static sendFileAsResponse(file: string, response: Response) {
        let readStream = fs.createReadStream(file)
        response.setHeader('Content-Type', "image/jpeg")
        readStream.on("open", () => {
            readStream.pipe(response)
        })
        readStream.on("close", () => {
            response.end()
        })
    }

}

export { 
    COVERS_DIRECTORY,
    MIME_TYPES
}
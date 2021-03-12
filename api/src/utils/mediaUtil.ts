import fs from 'fs'
import config from '../config/config'

import sharp from 'sharp'

import ffprobeStatic from 'ffprobe-static'
import ffprobe from 'ffprobe'
import { Endpoint } from '../endpoint/endpoint'
import { TrustedError } from '../error/trustedError'
import { Channel } from '../models/channel'
import { Response } from 'express'

const COVER_UPLOAD_DIR = config.app.rootDir + "/uploads/covers"

const COVER_CHANNEL_DIR = config.app.rootDir + "/artworks"
const COVER_FILE_EXTENSION = ".jpeg"
const COVER_FILE_PLACEHOLDER = config.app.rootDir+"/assets/images/ts_cover_placeholder.jpeg"

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
        if(!fs.existsSync(COVER_UPLOAD_DIR)) {
            fs.mkdirSync(COVER_UPLOAD_DIR, { recursive: true })
        }
        if(!fs.existsSync(COVER_CHANNEL_DIR)) {
            fs.mkdirSync(COVER_CHANNEL_DIR, { recursive: true })
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
    static async createCoverImage(channel: Channel, file, mimetype) {
        return new Promise<Endpoint.Result>(async(resolve) => {
            
            if(!this.isSupportedFormat(mimetype)) {
                return TrustedError.get(TrustedError.Errors.UNSUPPORTED_FORMAT)
            }

            let tempFile = COVER_UPLOAD_DIR + "/" + channel.uuid + ".temp."+this.getExtensionForMimetype(mimetype)

            let fsstream = fs.createWriteStream(tempFile)
            file.pipe(fsstream)
    
            fsstream.on('close', async () => {
                // Finished Upload: Delete previous cover file
                this.deleteCover(channel)
                let result = await this.optimizeCover(channel.uuid, tempFile)

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
     * @param channelId Id of channel
     * @param tempFile File of the temporary cover image
     * @returns Endpoint Result
     */
    static async optimizeCover(channelId: string, tempFile: string) {
        return new Promise<Endpoint.Result>((resolve) => {
            let optimizedFiled = COVER_UPLOAD_DIR + "/" + channelId + COVER_FILE_EXTENSION

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
                let file = COVER_UPLOAD_DIR + "/" + channel.uuid + COVER_FILE_EXTENSION
            
                this.deleteFile(file)
                resolve(new Endpoint.ResultSingleton(200, undefined))
            } catch (err) {
                resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
            }
        })
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
     * Get the current artwork file of a channel
     * @param channelId Channel's id
     * @returns File path
     */
    static getCurrentArtworkOfChannel(channelId: string) {
        let directory = COVER_CHANNEL_DIR + "/" + channelId + "/current/"
        let file = fs.readdirSync(directory)[0] || undefined

        if(file) {
            return directory + file
        } else {
            return COVER_FILE_PLACEHOLDER
        }
    }

    /**
     * Get the current artwork file of a channel
     * @param channelId Channel's id
     * @param timestamp Timestamp in history
     * @returns File path
     */
    static getHistoryArtworkOfChannel(channelId: string, timestamp: string) {
        let file = COVER_CHANNEL_DIR + "/" + channelId + "/history/" + timestamp + COVER_FILE_EXTENSION

        if(fs.existsSync(file)) {
            return file;
        } else {
            return COVER_FILE_PLACEHOLDER
        }
    }

    /**
     * Get the cover file of a given channel
     * @param channelId Channel's id
     * @returns File path
     */
    static getChannelCoverFile(channelId: string): string {
        let file = COVER_UPLOAD_DIR + "/" + channelId + COVER_FILE_EXTENSION

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
        if(!fs.existsSync(file)) {
            return
        }

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
    COVER_CHANNEL_DIR,
    MIME_TYPES
}
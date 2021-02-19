import fs from 'fs'
import config from '../config/config'

import sharp from 'sharp'

import ffprobeStatic from 'ffprobe-static'
import ffprobe from 'ffprobe'
import { Member } from '../account/member'
import { randomBytes } from 'crypto'
import { Endpoint } from '../endpoint/endpoint'
import { TrustedError } from '../error/trustedError'

const AVATARS_DIRECTORY = config.app.rootDir + "/uploads/avatars"
const MIME_TYPES = [
    { type: 'image/png', ext: '.png'},
    { type: 'image/gif', ext: '.gif'},
    { type: 'image/jpg', ext: '.jpg'},
    { type: 'image/jpeg', ext: '.jpeg'}
]

export class MediaUtil {

    static setupUploadDirectory() {
        if(!fs.existsSync(AVATARS_DIRECTORY)) {
            fs.mkdirSync(AVATARS_DIRECTORY, { recursive: true })
        }
    }

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
     * Creates an avatar for specific member.
     * The provided file is optimized to specifications (e.g.: size)
     * @param member Member object
     * @param file File to optimize
     * @returns {Endpoint.Result} Endpoint result
     */
    static async createAvatar(member: Member, file, mimetype) {
        return new Promise<Endpoint.Result>(async(resolve) => {
            let oldAvatarHash = member.avatar

            let newAvatarHash
            let file

            do {
                newAvatarHash = randomBytes(8).toString('hex')
                file = config.app.rootDir+"/uploads/avatars/"+newAvatarHash+".jpeg"
            } while(fs.existsSync(file))
            
            if(!this.isSupportedFormat(mimetype)) {
                return TrustedError.get(TrustedError.Errors.UNSUPPORTED_FORMAT)
            }

            let tempFile = AVATARS_DIRECTORY + "/" + newAvatarHash + ".temp."+this.getExtensionForMimetype(mimetype)
            let fsstream = fs.createWriteStream(tempFile)
            file.pipe(fsstream)
    
            fsstream.on('close', async () => {
                // Finished Upload
                // Delete previous avatar file and update avatar column in database
                this.deleteAvatarByHash(oldAvatarHash)
                await Member.update({ avatar: newAvatarHash }, { where: { uuid: member.uuid }})
                let result = await this.optimizeAvatar(newAvatarHash, tempFile)

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

    static async optimizeAvatar(avatarHash: string, tempFile: string) {
        return new Promise<Endpoint.Result>((resolve) => {
            let optimizedFiled = AVATARS_DIRECTORY + "/" + avatarHash + ".jpeg"

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

    static async deleteFile(file) {
        if(fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    }

    static async deleteAvatar(member: Member) {
        return new Promise<Endpoint.Result>((resolve) => {
            try {
                let avatarHash = member.avatar
                let file = AVATARS_DIRECTORY + "/" + avatarHash + ".jpeg"
            
                this.deleteFile(file)
                Member.update({ avatar: null }, { where: { uuid: member.uuid }}).finally(() => resolve(new Endpoint.ResultSingleton(200, undefined)))
            } catch (err) {
                resolve(TrustedError.get(TrustedError.Errors.INTERNAL_ERROR))
            }
        })
    }

    static async deleteAvatarByHash(avatarHash: string) {
        let file = AVATARS_DIRECTORY + "/" + avatarHash + ".jpeg"
        this.deleteFile(file)
    }

    static isSupportedFormat(mimetype: String) {
        return !!MIME_TYPES.find((element) => element.type == mimetype)
    }
    static getExtensionForMimetype(mimetype: string) {
        return MIME_TYPES.find((element) => element.type == mimetype)?.ext
    }

}
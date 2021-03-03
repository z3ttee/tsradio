import ReadParser, { j2xParser as WriteParser } from 'fast-xml-parser'

import { Channel } from '../models/channel'
import { existsSync, readFileSync, writeFile, writeFileSync } from 'fs'
import config from '../config/config'
import { execSync } from 'child_process'

const ICECAST_XML_FILE = config.app.rootDir + "/icecast.xml"
const API_AUTH_URL = config.app.host + ":" + config.app.port + "/auth/listener"

const XMLPARSER_WRITE_OPTIONS = {
    format: true,
    indentBy: '    ',  // 4 spaces
    ignoreAttributes: false
}

const XMLPARSER_READ_OPTIONS = {
    ignoreAttributes: false
}

export class IcecastUtil {

    /**
     * Insert new mount configuration into icecast.xml
     * @param channel Channel to configure a mount for
     * @returns True or False
     */
    static async addChannel(channel: Channel): Promise<Boolean>{
        if(!existsSync(ICECAST_XML_FILE)) return false

        var fileContent = await this.getFileContent()
        var icecastOptions = fileContent?.["icecast"]

        if(icecastOptions && channel) {
            let mounts = icecastOptions.mount || []

            if(typeof icecastOptions.mount == "object") {
                mounts = [ icecastOptions.mount ]
            }

            let newMount = this.buildMountpoint(channel.mountpoint)

            mounts.push(newMount)
            icecastOptions.mount = mounts
            fileContent["icecast"] = icecastOptions

            this.save(fileContent)
            
            if(channel.enabled) {
                this.restartIcecastService()
            }
            return true
        }   
        
        return false
    }

    /**
     * Delete a mountpoint from icecast.xml
     * @param mountpoint Mountpoint to be deleted
     * @returns True or False
     */
    static async deleteChannel(mountpoint: string): Promise<Boolean>{
        if(!existsSync(ICECAST_XML_FILE)) return false
        
        var index = await this.findChannelIndex(mountpoint)
        var icecast = await this.getFileContent()
        var mounts = icecast?.["icecast"]?.["mount"]

        if(Array.isArray(mounts)) {
            if(mounts?.[index]) {
                delete mounts?.[index]
                // Restart is not required when deleting a channel
                return this.save(icecast);
            }
        } else {
            // Is single object
            delete icecast?.["icecast"]?.["mount"]
            return this.save(icecast)
        }

        return false;
    }

    /**
     * Update a mountpoint in icecast.xml
     * @param mountpoint Mountpoint to be updated
     * @param updated Updated channel data
     * @returns True or False
     */
    static async updateChannel(mountpoint: string, updated: Channel): Promise<Boolean>{
        if(!existsSync(ICECAST_XML_FILE)) return false

        var index = await this.findChannelIndex(mountpoint)

        if(index == -2) {
            return await this.addChannel(updated)
        } else {
            return (await this.deleteChannel(mountpoint) && await this.addChannel(updated))
        }
    }

    /**
     * Get all configured mountpoints from icecast.xml
     * @returns Array of mounts
     */
    static async getFileContent(): Promise<Object> {
        var jsonObject = ReadParser.parse(readFileSync(ICECAST_XML_FILE).toString(), XMLPARSER_READ_OPTIONS)

        return jsonObject || {}
    }

    /**
     * Get the channels index in configured mounts array
     * @param mountpoint Mountpoint to find
     * @returns Index, -1 if single entry, -2 if not found
     */
    private static async findChannelIndex(mountpoint: string): Promise<number> {
        var icecast = await this.getFileContent()
        var mounts = icecast?.["icecast"]?.["mount"]

        if(Array.isArray(mounts)) {
            return mounts?.findIndex((value: any) => value && value["mount-name"] == this.formatMountpoint(mountpoint)) || -2
        } else {
            if(mounts?.["mount-name"] == this.formatMountpoint(mountpoint)) {
                return -1;
            }
            return -2;
        }
    }

    /**
     * Save modified data by writing it to icecast.xml file
     * @param data Data to be written
     * @returns True or False
     */
    private static async save(data: object): Promise<Boolean> {
        return new Promise<Boolean>((resolve) => {
            var xml = new WriteParser(XMLPARSER_WRITE_OPTIONS).parse(data)
            writeFile(ICECAST_XML_FILE, xml?.toString(), { encoding: 'utf-8', flag: 'w' }, (error) => {
                if(!error) {
                    resolve(true)
                } else {
                    console.error("An error occured when writing to icecast.xml: " + error.message)
                    resolve(false)
                }
            })
        })
    }

    /**
     * Format a given mountpoint
     * @param mountpoint Mountpoint to format
     * @returns Formatted mountpoint string
     */
    public static formatMountpoint(mountpoint: string): string {
        return "/" + mountpoint?.replace("/", "").toLowerCase()
    }

    /**
     * Build new mountpoint object to save in file
     * @param mountpoint Mountpoint's name
     * @returns Object
     */
    public static buildMountpoint(mountpoint: string): object {
        return {
            'mount-name': this.formatMountpoint(mountpoint),
            'authentication': {
                '@_type': 'url',
                'option': [
                    { '@_name': 'listener_add', '@_value': API_AUTH_URL },
                    { '@_name': 'headers', '@_value': 'cookie' }
                ]
            }
        }
    }

    /**
     * Restart the local icecast service running on the same machine
     */
    private static async restartIcecastService() {
        if(process.platform == "linux") {
            var stdin: Buffer = execSync("sudo service icecast2 restart")

            console.log(stdin.toString())
        }
        
        console.log("Restarting the icecast service is currently only available to linux machines")
    }

}
import { homedir, tmpdir } from "os"
import { resolve, join } from "path";

import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from "uuid"
import { Environment } from "@soundcore/common";
import { Channel } from "src/channel/entities/channel.entity";
import { Artwork } from "src/artworks/entities/artwork.entity";

@Injectable()
export class FileSystemService {
    private readonly _logger: Logger = new Logger("FileSystem");

    /**
     * Get the main config directory of the application.
     * @returns {string} Root directory path
     */
    public getInstanceDir(): string {
        if(Environment.isDockerized) {
            return resolve("/data/")
        }
        return join(homedir(), ".tsradio");
    }

    /**
     * Get the main config directory of the application.
     * @returns {string} Root directory path
     */
    public getLogsDir(): string {
        return join(this.getInstanceDir(), "logs");
    }

    /**
     * Get temporary directory of the application.
     * @returns {string} Filepath to temporary directory
     */
    public getTmpDir(): string {
        return join(tmpdir());
    }

    /**
     * Create a new temporary filepath to 
     * store a temporary file.
     * @param {string} (Optional) Filename for the temporary file
     * @returns {string} Filepath to temporary file
     */
    public createTmpPath(filename?: string): string {
        return join(tmpdir(), filename || uuidv4());
    }

    /**
     * Get root artworks directory of bucket.
     * @returns {string} Absolute filepath of artwork directory in bucket
     */
    public getArtworkRootDir(): string {
        return resolve(this.getInstanceDir(), "artworks");
    }

    /**
     * Get the root mounts directory.
     * This directory is used for mounts that were created using
     * paths that start with ./
     * @returns Absolute root directory path
     */
    public getChannelsRootDir(): string {
        return resolve(this.getInstanceDir(), "channels");
    }

    public resolveChannelDir(channel: Channel): string {
        return resolve(this.getChannelsRootDir(), channel.id);
    }

    public resolveArtworkPath(artwork: Artwork): string {
        return resolve(this.getArtworkRootDir(), `${artwork.filename}`);
    }

}

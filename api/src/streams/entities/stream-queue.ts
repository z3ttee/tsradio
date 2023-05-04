import { Channel } from "src/channel/entities/channel.entity";
import { FileSystemService } from "src/filesystem/services/filesystem.service";
import path from "node:path";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { globSync } from "glob";

export class StreamQueue {

    private readonly fs = new FileSystemService();
    private readonly queue: string[] = [];
    private readonly directory = this.fs.resolveChannelDir(this.channel);
    private readonly file = path.join(this.directory, ".queue");
    private isEmpty: boolean = false;

    constructor(private readonly channel: Channel) {
        this.rebuild(false);
    }

    /**
     * Get filepath of next track
     * @returns Path to file that should be played next
     */
    public getNext(): string {
        if(this.isEmpty) return null;

        if(this.queue.length <= 0) {
            this.rebuild(true);

            if(this.queue.length <= 0) {
                this.isEmpty = true;
                return null;
            }
        }

        // Calculate random index
        const index = Math.floor(Math.random() * this.queue.length);
        // Remove index from queue
        const item = this.queue.splice(index, 1)?.[0];
        // Save current queue to file
        this.persist();
        // Build filepath and return
        return path.join(this.directory, item);
    }

    private rebuild(deleteFile: boolean = false) {
        this.isEmpty = false;

        if(deleteFile) {
            unlinkSync(this.file);
        }

        if(!existsSync(this.file)) {    
            // Create a queue and save to file
            const audioFiles: string[] = globSync("*.mp3", { cwd: this.directory });
            this.queue.push(...audioFiles);
            this.persist();
        } else {
            // Otherwise read file   
            const buffer = readFileSync(this.file);
            const data: string[] = JSON.parse(buffer.toString());
            this.queue.push(...data);
        }
    }

    private persist() {
        writeFileSync(this.file, JSON.stringify(this.queue));
    }

    public clear() {
        this.queue.splice(0, this.queue.length);
    }

}
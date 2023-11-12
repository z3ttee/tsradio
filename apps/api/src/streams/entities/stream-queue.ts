import path, { dirname } from "node:path";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { globSync } from "glob";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Channel } from "../../channel/entities/channel.entity";

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

    private rebuild(deleteFile: boolean = false, tries = 0) {
        this.isEmpty = false;
        if(tries !== 0) return;

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
            try {
                const buffer = readFileSync(this.file);
                const data: string[] = JSON.parse(buffer.toString());
                this.queue.push(...data);
            } catch (err) {
                if(err instanceof Error) {
                    console.error(`Failed decoding .queue file for channel '${this.channel.id}': ${err.message}`);
                    console.error(`Recreating new .queue file...`);
                    this.rebuild(true, tries++);
                }
            }
            
        }
    }

    private persist() {
        mkdirSync(dirname(this.file), { recursive: true });
        writeFileSync(this.file, JSON.stringify(this.queue));
    }

    public clear() {
        this.queue.splice(0, this.queue.length);
    }

}
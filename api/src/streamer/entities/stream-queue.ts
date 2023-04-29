import { Channel } from "src/channel/entities/channel.entity";
import { FileSystemService } from "src/filesystem/services/filesystem.service";
import path from "node:path";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { globSync } from "glob";
import { ffprobe } from "@dropb/ffprobe";
import ffprobeStatic from "ffprobe-static";

ffprobe.path = ffprobeStatic.path;

export class StreamQueue {


    private readonly fs = new FileSystemService();
    private readonly queue: string[] = [];
    private readonly directory = this.fs.resolveChannelDir(this.channel);
    private readonly file = path.join(this.directory, ".queue")

    constructor(private readonly channel: Channel) {
        this.rebuild(false);
    }

    public async getTrackBitrate(filepath: string) {
        const data = await ffprobe(filepath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    public getNext(): string {
        if(this.queue.length <= 0) {
            this.rebuild(true);
        }

        const index = Math.floor(Math.random() * this.queue.length);
        const item = this.queue.splice(index, 1)?.[0];
        this.persist();
        return path.join(this.directory, item);
    }

    private rebuild(deleteFile: boolean = false) {
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

}